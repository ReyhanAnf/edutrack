<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\SubjectController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\QuestionLikeController;
use App\Http\Controllers\LeaderboardController;

use App\Http\Controllers\DashboardController;

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
    Route::post('questions/{question}/reactions/toggle', [App\Http\Controllers\QuestionReactionController::class, 'toggle'])
        ->name('questions.reactions.toggle');
    Route::post('answers/{answer}/likes/toggle', [App\Http\Controllers\AnswerLikeController::class, 'toggle'])
        ->name('answers.likes.toggle');
        
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard.index');
});

require __DIR__.'/auth.php';
