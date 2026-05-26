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

        return Inertia::render('Quiz/Index', [
            'quizzes' => $quizzes,
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
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
}
