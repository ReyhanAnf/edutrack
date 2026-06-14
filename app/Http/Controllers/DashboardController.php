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
        
        // Find next upcoming schedule
        $allSchedules = $user->schedules()->with('subject')->get();
        $now = Carbon::now();
        $nextSchedule = null;
        $minDiff = PHP_INT_MAX;

        foreach ($allSchedules as $schedule) {
            $scheduleTime = Carbon::createFromFormat('H:i:s', $schedule->start_time);
            $scheduleDay = $schedule->day;
            
            $occurrence = Carbon::now()->next($scheduleDay)->setTimeFrom($scheduleTime);
            
            if ($now->format('l') === $scheduleDay && $now->format('H:i:s') < $schedule->start_time) {
                $occurrence = Carbon::today()->setTimeFrom($scheduleTime);
            }

            $diff = $now->diffInSeconds($occurrence);
            
            if ($diff < $minDiff) {
                $minDiff = $diff;
                $schedule->next_occurrence = $occurrence->toIso8601String();
                $nextSchedule = $schedule;
            }
        }

        // Find next pending assignment
        $nextTask = $user->assignments()
            ->where('status', 'Pending')
            ->where('due_date', '>=', Carbon::today())
            ->orderBy('due_date', 'asc')
            ->first();
            
        if ($nextTask) {
            $nextTask->deadline_at = Carbon::parse($nextTask->due_date)->endOfDay()->toIso8601String();
        }

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
                'nextSchedule' => $nextSchedule,
                'nextTask' => $nextTask,
            ],
            'current_streak' => $streakService->getConsecutiveStreaks($user),
            'today_streak' => \App\Models\UserDailyStreak::where('user_id', $user->id)
                                ->where('date', \Carbon\Carbon::today()->toDateString())
                                ->first()?->toArray(),
        ]);
    }
}
