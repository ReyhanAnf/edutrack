<?php

namespace App\Http\Controllers;

use App\Http\Resources\QuestionResource;
use App\Http\Resources\SubjectResource;
use App\Models\Question;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Menampilkan dasbor aplikasi.
     */
    public function index(\App\Domains\Gamification\Services\UserStreakService $streakService)
    {
        $user = Auth::user();

        // Data Ringkasan
        $avgGrade = $user->grades()->avg('score') ?? 0;
        $pendingAssignments = $user->assignments()->where('status', 'Pending')->count();

        $today = Carbon::now()->format('l'); // contoh: Monday
        $todaysSchedule = $user->schedules()->where('day', $today)->orderBy('start_time')->with('subject')->get();
        $questions = Question::query()
            ->with(['user', 'subject'])
            ->withCount(['answers', 'likes'])
            ->withExists(['likes as liked_by_viewer' => fn ($query) => $query->where('user_id', Auth::id())])
            ->latest('last_activity_at')
            ->latest()
            ->get();

        return Inertia::render('Question/Index', [
            'questions' => QuestionResource::collection($questions),
            'subjects' => SubjectResource::collection($user->subjects()->orderBy('name')->get()),
            'dashboardStats' => [
                'avgGrade' => (float) $avgGrade,
                'pendingAssignments' => $pendingAssignments,
                'todaysSchedule' => $todaysSchedule,
            ],
            'current_streak' => $streakService->getConsecutiveStreaks($user),
            'today_streak' => \App\Models\UserDailyStreak::where('user_id', $user->id)
                                ->where('date', \Carbon\Carbon::today()->toDateString())
                                ->first()?->toArray(),
        ]);
    }
}
