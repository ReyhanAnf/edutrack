<?php

namespace App\Http\Middleware;

use App\Models\UserDailyStreak;
use App\Models\UserSubjectExp;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $gamification = null;
        if ($request->user()) {
            $userId = $request->user()->id;

            // Total XP across all subjects
            $totalXp = UserSubjectExp::where('user_id', $userId)->sum('xp');

            // Highest tier
            $tierOrder = ['Grandmaster' => 5, 'Master' => 4, 'Expert' => 3, 'Apprentice' => 2, 'Novice' => 1];
            $highestTier = UserSubjectExp::where('user_id', $userId)
                ->get()
                ->sortByDesc(fn ($e) => $tierOrder[$e->tier] ?? 0)
                ->first()?->tier ?? 'Novice';

            // Current consecutive streak
            $count = 0;
            $date = Carbon::today();
            while (true) {
                $record = UserDailyStreak::where('user_id', $userId)
                    ->where('date', $date->toDateString())
                    ->first();
                if (!$record || $record->status !== 'full') {
                    if ($date->isToday()) { $date->subDay(); continue; }
                    break;
                }
                $count++;
                $date->subDay();
            }

            // Today's streak status
            $todayStreak = UserDailyStreak::where('user_id', $userId)
                ->where('date', Carbon::today()->toDateString())
                ->first();

            $gamification = [
                'total_xp' => (int) $totalXp,
                'highest_tier' => $highestTier,
                'current_streak' => $count,
                'today_streak_status' => $todayStreak?->status ?? 'none',
                'today_qna_done' => (bool) ($todayStreak?->qna_done ?? false),
                'today_quiz_done' => (bool) ($todayStreak?->quiz_done ?? false),
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'is_admin' => $request->user()->hasAnyRole(['admin', 'super admin']),
                    'roles' => $request->user()->roles->pluck('name'),
                    'permissions' => $request->user()->hasRole('super admin')
                        ? ['*']
                        : $request->user()->getAllPermissions()->pluck('name'),
                    'pending_friend_requests_count' => $request->user()->friendRequestsReceived()->count(),
                    'unread_notifications_count' => $request->user()->unreadNotifications()->count(),
                ]) : null,
            ],
            'gamification' => $gamification,
        ];
    }
}
