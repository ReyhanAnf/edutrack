<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudyArena;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudyArenaController extends Controller
{
    public function index()
    {
        $arenas = StudyArena::with(['creator', 'subject'])
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $arenas,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'quiz_id' => 'nullable|exists:quizzes,id',
            'room_name' => 'required|string|max:255',
            'mode' => 'required|in:live_quiz_battle,study_case_room',
        ]);

        $arena = StudyArena::create([
            'created_by' => Auth::id() ?? 1, // fallback for testing without auth
            'subject_id' => $request->subject_id,
            'quiz_id' => $request->quiz_id,
            'room_name' => $request->room_name,
            'mode' => $request->mode,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Study Arena created successfully',
            'data' => $arena,
        ]);
    }
}
