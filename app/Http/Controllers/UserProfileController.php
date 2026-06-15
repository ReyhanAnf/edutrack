<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserDailyStreak;
use App\Models\UserSubjectExp;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    public function show(User $user)
    {
        $currentUser = Auth::user();

        // If it's the current user, redirect to profile edit
        if ($currentUser && $currentUser->id === $user->id) {
            return redirect()->route('profile.edit');
        }

        // Calculate bidirectional friends count accurately
        $totalFriendsCount = \App\Models\Friendship::where(function($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })
            ->where('status', 'accepted')
            ->count();

        $user->loadCount(['questions', 'answers']);
        
        $friendshipStatus = 'none';
        
        if ($currentUser) {
            $friendship = \App\Models\Friendship::where(function($query) use ($currentUser, $user) {
                $query->where('user_id', $currentUser->id)->where('friend_id', $user->id);
            })->orWhere(function($query) use ($currentUser, $user) {
                $query->where('user_id', $user->id)->where('friend_id', $currentUser->id);
            })->first();

            if ($friendship) {
                if ($friendship->status === 'accepted') {
                    $friendshipStatus = 'accepted';
                } else {
                    $friendshipStatus = (int) $friendship->user_id === (int) $currentUser->id ? 'pending_sent' : 'pending_received';
                }
            }
        }

        // Gamification data
        $totalXp = UserSubjectExp::where('user_id', $user->id)->sum('xp');
        $tierOrder = ['Grandmaster' => 5, 'Master' => 4, 'Expert' => 3, 'Apprentice' => 2, 'Novice' => 1];
        $highestTier = UserSubjectExp::where('user_id', $user->id)
            ->get()
            ->sortByDesc(fn ($e) => $tierOrder[$e->tier] ?? 0)
            ->first()?->tier ?? 'Novice';

        // Current consecutive streak
        $streakCount = 0;
        $date = Carbon::today();
        while (true) {
            $record = UserDailyStreak::where('user_id', $user->id)
                ->where('date', $date->toDateString())
                ->first();
            if (!$record || $record->status !== 'full') {
                if ($date->isToday()) { $date->subDay(); continue; }
                break;
            }
            $streakCount++;
            $date->subDay();
        }

        // Top subjects by XP
        $topSubjects = UserSubjectExp::where('user_id', $user->id)
            ->with('globalSubject')
            ->orderBy('xp', 'desc')
            ->limit(3)
            ->get();

        return Inertia::render('Profile/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'profile_photo_url' => $user->profile_photo_url,
                'school_class' => $user->school_class,
                'major' => $user->major,
                'institution' => $user->institution,
                'bio' => $user->bio,
                'friends_count' => $totalFriendsCount,
                'questions_count' => $user->questions_count,
                'answers_count' => $user->answers_count,
                'total_xp' => (int) $totalXp,
                'highest_tier' => $highestTier,
                'current_streak' => $streakCount,
                'top_subjects' => $topSubjects->map(fn ($e) => [
                    'name' => $e->globalSubject?->name ?? 'Unknown',
                    'color_code' => $e->globalSubject?->color_code ?? '#6b7280',
                    'xp' => $e->xp,
                    'tier' => $e->tier,
                ]),
            ],
            'friendshipStatus' => $friendshipStatus,
            'recentQuestions' => $user->questions()->latest()->take(5)->get(),
        ]);
    }
}
