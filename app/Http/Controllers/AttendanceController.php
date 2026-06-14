<?php

namespace App\Http\Controllers;

use App\Domains\Gamification\Actions\GetUserActivityStatsAction;
use App\Domains\Gamification\Actions\UpdateMissionProgressAction;
use App\Domains\Gamification\Services\UserStreakService;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\SubjectResource;
use App\Models\Attendance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(
        GetUserActivityStatsAction $statsAction, 
        UpdateMissionProgressAction $missionAction,
        UserStreakService $streakService
    ): Response
    {
        $user = Auth::user();
        
        // Update mission progress on page load
        $missionAction->execute($user);

        return Inertia::render('Attendance/Index', [
            'attendances' => AttendanceResource::collection(
                $user->attendances()->with('subject')->latest('date')->get()
            ),
            'activity_stats' => $statsAction->execute($user),
            'missions' => $user->userMissions()->with('mission')->get()->map(function ($um) {
                return [
                    'id' => $um->mission->id,
                    'name' => $um->mission->name,
                    'description' => $um->mission->description,
                    'requirement' => $um->mission->requirement,
                    'progress' => $um->progress,
                    'points_reward' => $um->mission->points_reward,
                    'completed_at' => $um->completed_at,
                ];
            }),
            'current_streak' => $streakService->getConsecutiveStreaks($user),
            'today_streak' => \App\Models\UserDailyStreak::where('user_id', $user->id)
                                ->where('date', \Carbon\Carbon::today()->toDateString())
                                ->first()?->toArray(),
            'pending_recovery' => \App\Models\UserStreakRecovery::where('user_id', $user->id)
                                ->where('status', 'pending')
                                ->first()?->toArray(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Attendance/Create', [
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttendanceRequest $request): RedirectResponse
    {
        Auth::user()->attendances()->create($request->validated());

        return redirect()->route('attendances.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Attendance $attendance)
    {
        abort(404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attendance $attendance): Response
    {
        if ($attendance->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Attendance/Edit', [
            'attendance' => new AttendanceResource($attendance),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttendanceRequest $request, Attendance $attendance): RedirectResponse
    {
        if ($attendance->user_id !== Auth::id()) {
            abort(403);
        }

        $attendance->update($request->validated());

        return redirect()->route('attendances.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attendance $attendance): RedirectResponse
    {
        if ($attendance->user_id !== Auth::id()) {
            abort(403);
        }

        $attendance->delete();

        return redirect()->route('attendances.index');
    }

    public function recoverStreak(UserStreakService $streakService): RedirectResponse
    {
        $user = Auth::user();
        $pendingRecovery = \App\Models\UserStreakRecovery::where('user_id', $user->id)
                            ->where('status', 'pending')
                            ->first();

        if (!$pendingRecovery) {
            return redirect()->back()->with('error', 'Tidak ada streak yang perlu dipulihkan.');
        }

        if ($streakService->payForRecovery($pendingRecovery)) {
            return redirect()->back()->with('success', 'Streak berhasil dipulihkan!');
        }

        return redirect()->back()->with('error', 'Poin "Aktivitas Streak" Anda tidak cukup untuk memulihkan streak.');
    }
}
