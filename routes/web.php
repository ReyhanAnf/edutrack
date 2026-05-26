<?php

use App\Http\Controllers\AnswerController;
use App\Http\Controllers\AnswerLikeController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AttendanceController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuestionLikeController;
use App\Http\Controllers\QuestionReactionController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\ScheduleController;

use App\Http\Controllers\SubjectController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;




Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('subjects', SubjectController::class);
    Route::resource('assignments', AssignmentController::class);
    Route::resource('attendances', AttendanceController::class);
    Route::resource('grades', GradeController::class);
    Route::resource('schedules', ScheduleController::class);
    Route::resource('notes', NoteController::class);
    Route::resource('questions', QuestionController::class)->only(['index', 'create', 'store', 'show', 'update']);
    Route::post('questions/{question}/answers', [AnswerController::class, 'store'])->name('questions.answers.store');
    Route::patch('questions/{question}/answers/{answer}/brainliest', [AnswerController::class, 'markBrainliest'])
        ->name('questions.answers.brainliest');
    Route::post('questions/{question}/likes/toggle', [QuestionLikeController::class, 'toggle'])
        ->name('questions.likes.toggle');
    Route::post('questions/{question}/reactions/toggle', [QuestionReactionController::class, 'toggle'])
        ->name('questions.reactions.toggle');
    Route::post('answers/{answer}/likes/toggle', [AnswerLikeController::class, 'toggle'])
        ->name('answers.likes.toggle');
        
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard.index');

    Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index');
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');

    // API-style routes moved to Web for Session Authentication
    Route::post('/api-web/quizzes/generate', [App\Http\Controllers\Api\QuizController::class, 'generate'])->name('quizzes.generate');
    Route::post('/api-web/quizzes/{id}/toggle-public', [App\Http\Controllers\Api\QuizController::class, 'togglePublic'])->name('quizzes.toggle-public');
    Route::post('/api-web/ai/parse-url', [App\Http\Controllers\Api\AiAssistantController::class, 'parseUrl'])->name('ai.parse-url');
});

require __DIR__.'/auth.php';
