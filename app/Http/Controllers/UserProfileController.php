<?php

namespace App\Http\Controllers;

use App\Models\User;
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
        
        $friendshipStatus = 'none'; // none, pending_sent, pending_received, accepted
        
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
            ],
            'friendshipStatus' => $friendshipStatus,
            'recentQuestions' => $user->questions()->latest()->take(5)->get(),
        ]);
    }
}
