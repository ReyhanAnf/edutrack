<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalSubject;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = GlobalSubject::latest()->get()->map(function ($gs) {
            return [
                'id' => $gs->id,
                'name' => $gs->name,
                'color_code' => $gs->color_code,
                'users_count' => $gs->subjects()->distinct('user_id')->count(),
                'created_at' => $gs->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:global_subjects,name',
            'color_code' => 'required|string|max:7|starts_with:#',
        ]);

        GlobalSubject::create($validated);

        return redirect()->back()->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function update(Request $request, GlobalSubject $subject)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:global_subjects,name,' . $subject->id,
            'color_code' => 'required|string|max:7|starts_with:#',
        ]);

        // Update all per-user subjects with the new name/color
        $subject->subjects()->update([
            'name' => $validated['name'],
            'color_code' => $validated['color_code'],
        ]);

        $subject->update($validated);

        return redirect()->back()->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroy(GlobalSubject $subject)
    {
        $usersUsing = $subject->subjects()->distinct('user_id')->count();

        if ($usersUsing > 0) {
            return redirect()->back()->with('error', "Tidak dapat menghapus: {$usersUsing} pengguna masih menggunakan mata pelajaran ini.");
        }

        $subject->delete();

        return redirect()->back()->with('success', 'Mata pelajaran berhasil dihapus.');
    }
}
