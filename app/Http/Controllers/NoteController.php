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
                Auth::user()->notes()->with(['subject', 'attachments'])->latest()->get()
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

        $note = Auth::user()->notes()->create($data);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('note_attachments', 'public');
                $type = explode('/', $file->getMimeType())[0] === 'image' ? 'image' : 'pdf';
                
                $note->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $type,
                    'file_size' => $file->getSize(),
                ]);
            }
        }

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
        if ((int) $note->user_id !== (int) Auth::id()) {
            abort(403);
        }

        return Inertia::render('Note/Edit', [
            'note' => new NoteResource($note->load('attachments')),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNoteRequest $request, Note $note): RedirectResponse
    {
        if ((int) $note->user_id !== (int) Auth::id()) {
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

        if ($request->filled('deleted_attachments')) {
            $attachmentsToDelete = $note->attachments()->whereIn('id', $request->deleted_attachments)->get();
            foreach ($attachmentsToDelete as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
        }

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('note_attachments', 'public');
                $type = explode('/', $file->getMimeType())[0] === 'image' ? 'image' : 'pdf';
                
                $note->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $type,
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('notes.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note): RedirectResponse
    {
        if ((int) $note->user_id !== (int) Auth::id()) {
            abort(403);
        }

        if ($note->image_path) {
            Storage::disk('public')->delete($note->image_path);
        }

        foreach ($note->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $note->delete();

        return redirect()->route('notes.index');
    }
}
