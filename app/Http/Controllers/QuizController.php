<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Http\Resources\SubjectResource;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();
        
        $quizzes = Quiz::with(['user', 'subject'])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhere('is_public', true);
            })
            ->latest()
            ->get();

        $notes = \App\Models\Note::with('subject:id,name,color_code')
            ->where('user_id', $userId)
            ->select('id', 'title', 'subject_id', 'created_at')
            ->latest()
            ->get();

        return Inertia::render('Quiz/Index', [
            'quizzes' => $quizzes,
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
            'notes' => $notes,
        ]);
    }

    public function show(Quiz $quiz): Response
    {
        $quiz->load(['questions', 'user', 'subject']);

        if (!$quiz->is_public && $quiz->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Quiz/Show', [
            'quiz' => $quiz,
        ]);
    }

    public function finish(Quiz $quiz, \Illuminate\Http\Request $request, \App\Domains\Gamification\Services\UserStreakService $streakService): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if ($user) {
            $streakService->recordActivity($user, 'quiz');
            
            $saveScore = $request->input('save_score', false);
            if ($saveScore) {
                $request->validate([
                    'score' => 'required|integer',
                    'total_questions' => 'required|integer',
                ]);
                
                \App\Models\QuizAttempt::updateOrCreate(
                    ['quiz_id' => $quiz->id, 'user_id' => $user->id],
                    [
                        'score' => $request->input('score'),
                        'total_questions' => $request->input('total_questions'),
                    ]
                );
            }
        }

        return response()->json(['success' => true]);
    }

    public function attempts(Quiz $quiz): Response
    {
        if ($quiz->user_id !== Auth::id()) {
            abort(403, 'Hanya pembuat kuis yang dapat melihat daftar peserta.');
        }

        $attempts = \App\Models\QuizAttempt::with('user')
            ->where('quiz_id', $quiz->id)
            ->latest('updated_at')
            ->get();

        return Inertia::render('Quiz/Attempts', [
            'quiz' => $quiz,
            'attempts' => $attempts,
        ]);
    }

    public function myScores(): Response
    {
        $attempts = \App\Models\QuizAttempt::with(['quiz.subject', 'quiz.user'])
            ->where('user_id', Auth::id())
            ->latest('updated_at')
            ->get();

        return Inertia::render('Quiz/MyScores', [
            'attempts' => $attempts,
        ]);
    }
}
