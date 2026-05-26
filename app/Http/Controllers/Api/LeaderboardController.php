<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSubjectExp;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    /**
     * Get overall or subject-specific leaderboard
     */
    public function index(Request $request)
    {
        $subjectId = $request->query('subject_id');

        $query = UserSubjectExp::with(['user', 'subject']);

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        $leaderboard = $query->orderBy('xp', 'desc')
            ->take(10)
            ->get()
            ->map(function ($item) {
                return [
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name,
                    'subject' => $item->subject->name,
                    'xp' => $item->xp,
                    'tier' => $item->tier,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $leaderboard,
        ]);
    }
}
