<?php

namespace App\Http\Controllers;

use App\Models\UserSubjectExp;
use App\Models\GlobalSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $subjectId = $request->query('subject_id');

        $query = UserSubjectExp::with(['user', 'globalSubject']);

        if ($subjectId) {
            $query->where('global_subject_id', $subjectId);
        }

        $leaderboard = $query->orderBy('xp', 'desc')
            ->take(50)
            ->get();

        $subjects = GlobalSubject::all();

        return Inertia::render('Leaderboard/Index', [
            'leaderboard' => $leaderboard,
            'subjects' => $subjects,
            'filters' => [
                'subject_id' => $subjectId,
            ]
        ]);
    }
}
