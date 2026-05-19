<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGradeRequest;
use App\Http\Requests\UpdateGradeRequest;
use App\Http\Resources\GradeResource;
use App\Http\Resources\SubjectResource;
use App\Models\Grade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Grade/Index', [
            'grades' => GradeResource::collection(
                Auth::user()->grades()->with('subject')->latest()->get()
            ),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Grade/Create', [
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGradeRequest $request): RedirectResponse
    {
        Auth::user()->grades()->create($request->validated());

        return redirect()->route('grades.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Grade $grade)
    {
        abort(404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Grade $grade): Response
    {
        if ($grade->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Grade/Edit', [
            'grade' => new GradeResource($grade),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGradeRequest $request, Grade $grade): RedirectResponse
    {
        if ($grade->user_id !== Auth::id()) {
            abort(403);
        }

        $grade->update($request->validated());

        return redirect()->route('grades.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Grade $grade): RedirectResponse
    {
        if ($grade->user_id !== Auth::id()) {
            abort(403);
        }

        $grade->delete();

        return redirect()->route('grades.index');
    }
}
