<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MissionController extends Controller
{
    public function index()
    {
        $missions = Mission::latest()->get()->map(function ($mission) {
            return [
                'id' => $mission->id,
                'name' => $mission->name,
                'description' => $mission->description,
                'type' => $mission->type,
                'requirement' => $mission->requirement,
                'points_reward' => $mission->points_reward,
                'created_at' => $mission->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Admin/Missions/Index', [
            'missions' => $missions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'type' => 'required|string|in:total_activity,total_questions,total_quizzes,total_answers,streak_days',
            'requirement' => 'required|integer|min:1',
            'points_reward' => 'required|integer|min:0',
        ]);

        Mission::create($validated);

        return redirect()->back()->with('success', 'Misi berhasil ditambahkan.');
    }

    public function update(Request $request, Mission $mission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'type' => 'required|string|in:total_activity,total_questions,total_quizzes,total_answers,streak_days',
            'requirement' => 'required|integer|min:1',
            'points_reward' => 'required|integer|min:0',
        ]);

        $mission->update($validated);

        return redirect()->back()->with('success', 'Misi berhasil diperbarui.');
    }

    public function destroy(Mission $mission)
    {
        $mission->delete();

        return redirect()->back()->with('success', 'Misi berhasil dihapus.');
    }
}
