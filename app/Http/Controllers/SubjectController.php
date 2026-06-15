<?php

namespace App\Http\Controllers;

use App\Models\GlobalSubject;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Display all GlobalSubjects and which ones the user has added.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $userSubjectIds = $user->subjects()->pluck('global_subject_id')->filter()->toArray();

        $globalSubjects = GlobalSubject::orderBy('name')->get()->map(function ($gs) use ($userSubjectIds) {
            return [
                'id' => $gs->id,
                'name' => $gs->name,
                'color_code' => $gs->color_code,
                'is_added' => in_array($gs->id, $userSubjectIds),
            ];
        });

        return Inertia::render('Subject/Index', [
            'subjects' => $globalSubjects,
        ]);
    }

    /**
     * Add a GlobalSubject to the user's subject list.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'global_subject_id' => 'required|exists:global_subjects,id',
        ]);

        $user = Auth::user();
        $globalSubject = GlobalSubject::findOrFail($validated['global_subject_id']);

        // Check if already added
        $exists = $user->subjects()->where('global_subject_id', $globalSubject->id)->exists();
        if ($exists) {
            return redirect()->route('subjects.index')->with('error', 'Mata pelajaran sudah ditambahkan.');
        }

        $user->subjects()->create([
            'name' => $globalSubject->name,
            'color_code' => $globalSubject->color_code,
            'global_subject_id' => $globalSubject->id,
        ]);

        return redirect()->route('subjects.index')->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    /**
     * Remove a subject from the user's list by GlobalSubject ID.
     */
    public function destroy(int $globalSubjectId): RedirectResponse
    {
        $subject = Auth::user()->subjects()->where('global_subject_id', $globalSubjectId)->firstOrFail();
        $subject->delete();

        return redirect()->route('subjects.index')->with('success', 'Mata pelajaran berhasil dihapus dari daftar Anda.');
    }
}
