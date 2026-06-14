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

    public function finish(Quiz $quiz, \App\Domains\Gamification\Services\UserStreakService $streakService): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        if ($user) {
            $streakService->recordActivity($user, 'quiz');
        }

        return response()->json(['success' => true]);
    }
}
