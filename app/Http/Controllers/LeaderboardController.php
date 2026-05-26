<?php

namespace App\Http\Controllers;

use App\Models\UserSubjectExp;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $subjectId = $request->query('subject_id');

        $query = UserSubjectExp::with(['user', 'subject']);

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        $leaderboard = $query->orderBy('xp', 'desc')
            ->take(50)
            ->get();

        $subjects = Subject::all();

        return Inertia::render('Leaderboard/Index', [
            'leaderboard' => $leaderboard,
            'subjects' => $subjects,
            'filters' => [
                'subject_id' => $subjectId,
            ]
        ]);
    }
}
