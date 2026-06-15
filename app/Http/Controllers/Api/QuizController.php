<?php

namespace App\Http\Controllers\Api;

use App\Domains\ArtificialIntelligence\Actions\GenerateQuizDataAction;
use App\Domains\ArtificialIntelligence\Actions\SaveGeneratedQuizAction;
use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        
        $quizzes = Quiz::with(['user', 'subject'])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhere('is_public', true);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $quizzes,
        ]);
    }

    public function generate(Request $request, GenerateQuizDataAction $generateAction, SaveGeneratedQuizAction $saveAction)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'count' => 'integer|in:5,10,15',
            'source' => 'required|in:notes,ai_knowledge',
            'custom_prompt' => 'nullable|string|max:1000',
            'note_ids' => 'nullable|array',
            'note_ids.*' => 'integer|exists:notes,id',
        ]);

        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $subjectId = $request->subject_id;
        $count = $request->input('count', 5);
        $source = $request->input('source', 'notes');
        $customPrompt = $request->input('custom_prompt');
        $noteIds = $request->input('note_ids');

        try {
            $questionsData = $generateAction->execute($userId, $subjectId, $count, $customPrompt, $noteIds, $source);

            if (empty($questionsData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not enough notes or questions to generate a quiz for this subject.',
                ], 400);
            }

            $quiz = $saveAction->execute($userId, $subjectId, $questionsData);

            // Record Gamification Streak Activity for Quiz
            $user = \App\Models\User::find($userId);
            if ($user) {
                app(\App\Domains\Gamification\Services\UserStreakService::class)->recordActivity($user, 'quiz');
            }

            return response()->json([
                'success' => true,
                'message' => 'Quiz generated successfully',
                'data' => $quiz->load('questions'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate kuis: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $quiz = Quiz::with(['questions', 'user', 'subject'])->findOrFail($id);

        if (!$quiz->is_public && $quiz->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this quiz.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $quiz,
        ]);
    }

    public function togglePublic($id)
    {
        $quiz = Quiz::where('user_id', Auth::id())->findOrFail($id);
        
        $quiz->update([
            'is_public' => !$quiz->is_public,
        ]);

        if ($quiz->is_public) {
            // Create a timeline post (Question) for the shared quiz
            \App\Models\Question::create([
                'user_id' => Auth::id(),
                'subject_id' => $quiz->subject_id,
                'quiz_id' => $quiz->id,
                'title' => "Rekomendasi Kuis: {$quiz->title}",
                'body' => "Halo semua! Saya baru saja menyelesaikan kuis \"{$quiz->title}\". Ayo coba kerjakan dan uji pemahamanmu!",
                'source_type' => 'ai_quiz',
                'status' => 'open',
                'last_activity_at' => now(),
            ]);
        } else {
            // Remove from timeline if made private
            \App\Models\Question::where('quiz_id', $quiz->id)->delete();
        }

        if (request()->wantsJson() && !request()->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => $quiz->is_public ? 'Quiz is now public' : 'Quiz is now private',
                'data' => $quiz,
            ]);
        }

        return redirect()->back();
    }
}
