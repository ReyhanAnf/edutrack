<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use App\Http\Resources\SubjectResource;
use App\Models\Note;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Note/Index', [
            'notes' => NoteResource::collection(
                Auth::user()->notes()->with('subject')->latest()->get()
            ),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Note/Create', [
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNoteRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('notes', 'public');
        }

        Auth::user()->notes()->create($data);

        return redirect()->route('notes.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Note $note)
    {
        abort(404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Note $note): Response
    {
        if ($note->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Note/Edit', [
            'note' => new NoteResource($note),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNoteRequest $request, Note $note): RedirectResponse
    {
        if ($note->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($note->image_path) {
                Storage::disk('public')->delete($note->image_path);
            }
            $data['image_path'] = $request->file('image')->store('notes', 'public');
        }

        $note->update($data);

        return redirect()->route('notes.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note): RedirectResponse
    {
        if ($note->user_id !== Auth::id()) {
            abort(403);
        }

        if ($note->image_path) {
            Storage::disk('public')->delete($note->image_path);
        }

        $note->delete();

        return redirect()->route('notes.index');
    }
}
