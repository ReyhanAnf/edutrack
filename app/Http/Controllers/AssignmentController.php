<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssignmentRequest;
use App\Http\Requests\UpdateAssignmentRequest;
use App\Http\Resources\AssignmentResource;
use App\Http\Resources\SubjectResource;
use App\Models\Assignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Assignment/Index', [
            'assignments' => AssignmentResource::collection(
                Auth::user()->assignments()->with('subject')->latest()->get()
            ),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Assignment/Create', [
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAssignmentRequest $request): RedirectResponse
    {
        Auth::user()->assignments()->create($request->validated());

        return redirect()->route('assignments.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Assignment $assignment)
    {
        abort(404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Assignment $assignment): Response
    {
        return Inertia::render('Assignment/Edit', [
            'assignment' => new AssignmentResource($assignment),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAssignmentRequest $request, Assignment $assignment): RedirectResponse
    {
        $assignment->update($request->validated());

        return redirect()->route('assignments.index');
    }

    public function toggleStatus(Assignment $assignment): RedirectResponse
    {
        $assignment->update([
            'status' => $assignment->status === 'Pending' ? 'Completed' : 'Pending'
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Assignment $assignment): RedirectResponse
    {
        $assignment->delete();

        return redirect()->route('assignments.index');
    }
}
