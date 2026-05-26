<?php

namespace App\Http\Controllers;

use App\Domains\QuestionAnswer\Services\QuestionWorkflowService;
use App\Events\QuestionUpdated;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionResource;
use App\Http\Resources\SubjectResource;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(): Response
    {
        $questions = Question::query()
            ->with(['user', 'subject', 'reactions'])
            ->withCount('answers')
            ->withCount('likes')
            ->withExists(['likes as liked_by_viewer' => fn ($query) => $query->where('user_id', Auth::id())])
            ->latest('last_activity_at')
            ->latest()
            ->get();

        $questions->each(function ($question) {
            $question->setAttribute(
                'user_reaction',
                $question->reactions->where('user_id', Auth::id())->first()?->reaction
            );
        });

        return Inertia::render('Question/Index', [
            'questions' => QuestionResource::collection($questions),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Question/Create', [
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    public function store(StoreQuestionRequest $request, QuestionWorkflowService $workflow): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('questions', 'public');
        }

        $question = $workflow->createTextQuestion(Auth::user(), $data);

        if ($request->boolean('stay_on_timeline')) {
            return redirect()->route('questions.index');
        }

        return redirect()->route('questions.show', $question);
    }

    public function update(UpdateQuestionRequest $request, Question $question): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($question->image_path) {
                Storage::disk('public')->delete($question->image_path);
            }
            $data['image_path'] = $request->file('image')->store('questions', 'public');
        }

        $question->update($data);

        QuestionUpdated::dispatch($question->fresh());

        return back();
    }

    public function show(Question $question): Response
    {
        $question->load([
            'user',
            'subject',
            'answers' => fn ($query) => $query->with('user')
                ->withCount('likes')
                ->withExists(['likes as liked_by_viewer' => fn ($q) => $q->where('user_id', Auth::id())])
                ->orderByDesc('likes_count')
                ->latest(),
            'reactions',
        ])->loadCount('likes');

        $question->setAttribute(
            'liked_by_viewer',
            $question->likes()->where('user_id', Auth::id())->exists()
        );

        $question->setAttribute(
            'user_reaction',
            $question->reactions()->where('user_id', Auth::id())->first()?->reaction
        );

        return Inertia::render('Question/Show', [
            'question' => new QuestionResource($question),
        ]);
    }
}
