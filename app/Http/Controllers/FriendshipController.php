<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendshipController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $allFriends = $user->all_friends;

        return inertia('Profile/Friends', [
            'friends' => $allFriends->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'profile_photo_url' => $u->profile_photo_url,
                'institution' => $u->institution,
            ]),
            'pendingRequests' => $user->friendRequestsReceived()->get()->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'profile_photo_url' => $u->profile_photo_url,
                'institution' => $u->institution,
            ]),
            'sentRequests' => $user->friendRequestsSent()->get()->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'profile_photo_url' => $u->profile_photo_url,
                'institution' => $u->institution,
            ]),
        ]);
    }

    public function store(User $user)
    {
        if (Auth::id() === $user->id) {
            return back()->with('error', 'Anda tidak bisa berteman dengan diri sendiri.');
        }

        // Check if already friends or request exists
        $exists = Friendship::where(function($q) use ($user) {
            $q->where('user_id', Auth::id())->where('friend_id', $user->id);
        })->orWhere(function($q) use ($user) {
            $q->where('user_id', $user->id)->where('friend_id', Auth::id());
        })->exists();

        if ($exists) {
            return back()->with('error', 'Permintaan sudah ada atau sudah berteman.');
        }

        Friendship::create([
            'user_id' => Auth::id(),
            'friend_id' => $user->id,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Permintaan pertemanan dikirim.');
    }

    public function accept(User $user)
    {
        $friendship = Friendship::where('user_id', $user->id)
            ->where('friend_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        return back()->with('success', 'Permintaan pertemanan diterima.');
    }

    public function destroy(User $user)
    {
        Friendship::where(function($q) use ($user) {
            $q->where('user_id', Auth::id())->where('friend_id', $user->id);
        })->orWhere(function($q) use ($user) {
            $q->where('user_id', $user->id)->where('friend_id', Auth::id());
        })->delete();

        return back()->with('success', 'Pertemanan dihapus.');
    }
}
