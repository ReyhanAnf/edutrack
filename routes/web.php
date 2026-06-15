<?php

use App\Http\Controllers\AnswerController;
use App\Http\Controllers\AnswerLikeController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AttendanceController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FriendshipController;
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
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\SearchController;
use App\Models\Question;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;




Route::get('/', function () {
    $featuredQuestions = Question::query()
        ->with([
            'user',
            'subject',
            'brainliestAnswer.user',
        ])
        ->withCount('answers')
        ->latest()
        ->limit(20)
        ->get()
        ->map(fn (Question $question) => [
            'id' => $question->id,
            'title' => $question->title,
            'body' => $question->body,
            'answers_count' => $question->answers_count,
            'created_at' => $question->created_at,
            'likes_count' => $question->likes_count ?? 0,
            'subject' => $question->subject ? [
                'id' => $question->subject->id,
                'name' => $question->subject->name,
                'color_code' => $question->subject->color_code,
            ] : null,
            'user' => [
                'id' => $question->user?->id,
                'name' => $question->user?->name,
            ],
            'answer_preview' => $question->brainliestAnswer?->body ?? null,
            'answer_author' => $question->brainliestAnswer?->user?->name ?? null,
        ]);

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'featuredQuestions' => $featuredQuestions,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/questions', [QuestionController::class, 'index'])->name('questions.index');
Route::get('/questions/{question}', [QuestionController::class, 'show'])->name('questions.show');

// Public User Profiles & Search
Route::get('/users/{user}', [UserProfileController::class, 'show'])->name('users.show');
Route::get('/search', [SearchController::class, 'index'])->name('search.index');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('subjects', SubjectController::class);
    Route::resource('assignments', AssignmentController::class);
    Route::patch('/assignments/{assignment}/toggle-status', [AssignmentController::class, 'toggleStatus'])
        ->name('assignments.toggle-status');
    Route::resource('attendances', AttendanceController::class);
    Route::resource('grades', GradeController::class);
    Route::resource('schedules', ScheduleController::class);
    Route::resource('notes', NoteController::class);
    Route::post('/attendances/recover-streak', [AttendanceController::class, 'recoverStreak'])->name('attendances.recover-streak');
    Route::resource('questions', QuestionController::class)->only(['create', 'store', 'update']);
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
    
    Route::get('/friends', [FriendshipController::class, 'index'])->name('friends.index');
    Route::post('/friends/{user}', [FriendshipController::class, 'store'])->name('friends.store');
    Route::patch('/friends/{user}/accept', [FriendshipController::class, 'accept'])->name('friends.accept');
    Route::delete('/friends/{user}', [FriendshipController::class, 'destroy'])->name('friends.destroy');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('/notifications/subscribe', [\App\Http\Controllers\NotificationController::class, 'subscribe'])->name('notifications.subscribe');
    Route::post('/notifications/unsubscribe', [\App\Http\Controllers\NotificationController::class, 'unsubscribe'])->name('notifications.unsubscribe');

    // Quizzes
    Route::get('/quizzes/my-scores', [QuizController::class, 'myScores'])->name('quizzes.my-scores');
    Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index');
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::get('/quizzes/{quiz}/attempts', [QuizController::class, 'attempts'])->name('quizzes.attempts');
    Route::post('/quizzes/{quiz}/finish', [QuizController::class, 'finish'])->name('quizzes.finish');

    // API-style routes moved to Web for Session Authentication
    Route::post('/api-web/quizzes/generate', [App\Http\Controllers\Api\QuizController::class, 'generate'])->name('quizzes.generate');
    Route::post('/api-web/quizzes/{id}/toggle-public', [App\Http\Controllers\Api\QuizController::class, 'togglePublic'])->name('quizzes.toggle-public');
    Route::post('/api-web/ai/parse-url', [App\Http\Controllers\Api\AiAssistantController::class, 'parseUrl'])->name('ai.parse-url');

    // Admin Routes
    Route::middleware(['role:admin|super admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/toggle-active', [\App\Http\Controllers\Admin\UserController::class, 'toggleActive'])->name('users.toggle-active');
        Route::patch('/users/{user}/reset-password', [\App\Http\Controllers\Admin\UserController::class, 'resetPassword'])->name('users.reset-password');
        
        Route::get('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('roles.destroy');

        Route::post('/permissions', [\App\Http\Controllers\Admin\PermissionController::class, 'store'])->name('permissions.store');
        Route::put('/permissions/{permission}', [\App\Http\Controllers\Admin\PermissionController::class, 'update'])->name('permissions.update');
        Route::delete('/permissions/{permission}', [\App\Http\Controllers\Admin\PermissionController::class, 'destroy'])->name('permissions.destroy');

        Route::get('/missions', [\App\Http\Controllers\Admin\MissionController::class, 'index'])->name('missions.index');
        Route::post('/missions', [\App\Http\Controllers\Admin\MissionController::class, 'store'])->name('missions.store');
        Route::put('/missions/{mission}', [\App\Http\Controllers\Admin\MissionController::class, 'update'])->name('missions.update');
        Route::delete('/missions/{mission}', [\App\Http\Controllers\Admin\MissionController::class, 'destroy'])->name('missions.destroy');
    });
});

require __DIR__.'/auth.php';
