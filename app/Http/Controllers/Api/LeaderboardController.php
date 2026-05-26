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
        $globalSubjectId = null;

        if ($subjectId) {
            $subject = \App\Models\Subject::find($subjectId);
            $globalSubjectId = $subject?->global_subject_id;
        }

        $query = UserSubjectExp::with(['user', 'globalSubject']);

        if ($globalSubjectId) {
            $query->where('global_subject_id', $globalSubjectId);
        }

        $leaderboard = $query->orderBy('xp', 'desc')
            ->take(10)
            ->get()
            ->map(function ($item) {
                return [
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name,
                    'subject' => $item->globalSubject->name,
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
