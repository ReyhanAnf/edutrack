<?php

namespace App\Http\Controllers;

use App\Domains\Gamification\Services\UserStreakService;
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
use Carbon\Carbon;

class QuestionController extends Controller
{
    public function index(UserStreakService $streakService): Response
    {
        $user = Auth::user();

        $query = Question::query()
            ->with(['user', 'subject', 'reactions'])
            ->withCount('answers')
            ->withCount('likes');

        if ($user) {
            $query->withExists(['likes as liked_by_viewer' => fn ($q) => $q->where('user_id', $user->id)]);
        }

        $questions = $query->latest('last_activity_at')
            ->latest()
            ->get();

        if ($user) {
            $questions->each(function ($question) use ($user) {
                $question->setAttribute(
                    'user_reaction',
                    $question->reactions->where('user_id', $user->id)->first()?->reaction
                );
            });
        }

        $dashboardStats = null;
        if ($user) {
            $avgGrade = $user->grades()->avg('score') ?? 0;
            $pendingAssignments = $user->assignments()->where('status', 'Pending')->count();

            $today = Carbon::now()->format('l');
            $todaysSchedule = $user->schedules()->where('day', $today)->orderBy('start_time')->with('subject')->get();
            
            $allSchedules = $user->schedules()->with('subject')->get();
            $now = Carbon::now();
            $nextSchedule = null;
            $minDiff = PHP_INT_MAX;

            foreach ($allSchedules as $schedule) {
                $scheduleTime = Carbon::createFromFormat('H:i:s', $schedule->start_time);
                $scheduleDay = $schedule->day;
                
                $occurrence = Carbon::now()->next($scheduleDay)->setTimeFrom($scheduleTime);
                
                if ($now->format('l') === $scheduleDay && $now->format('H:i:s') < $schedule->start_time) {
                    $occurrence = Carbon::today()->setTimeFrom($scheduleTime);
                }

                $diff = $now->diffInSeconds($occurrence);
                
                if ($diff < $minDiff) {
                    $minDiff = $diff;
                    $schedule->next_occurrence = $occurrence->toIso8601String();
                    $nextSchedule = $schedule;
                }
            }

            $nextTask = $user->assignments()
                ->where('status', 'Pending')
                ->where('due_date', '>=', Carbon::today())
                ->orderBy('due_date', 'asc')
                ->first();
                
            if ($nextTask) {
                $nextTask->deadline_at = Carbon::parse($nextTask->due_date)->endOfDay()->toIso8601String();
            }

            $dashboardStats = [
                'avgGrade' => (float) $avgGrade,
                'pendingAssignments' => $pendingAssignments,
                'todaysSchedule' => $todaysSchedule,
                'nextSchedule' => $nextSchedule,
                'nextTask' => $nextTask,
            ];
        }

        return Inertia::render('Question/Index', [
            'questions' => QuestionResource::collection($questions),
            'subjects' => $user ? SubjectResource::collection($user->subjects()->orderBy('name')->get()) : ['data' => []],
            'dashboardStats' => $dashboardStats,
            'current_streak' => $user ? $streakService->getConsecutiveStreaks($user) : 0,
            'today_streak' => $user ? \App\Models\UserDailyStreak::where('user_id', $user->id)
                                ->where('date', \Carbon\Carbon::today()->toDateString())
                                ->first()?->toArray() : null,
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
        $user = Auth::user();

        $question->load([
            'user',
            'subject',
            'answers' => function ($query) use ($user) {
                $q = $query->with('user')->withCount('likes')->orderByDesc('likes_count')->latest();
                if ($user) {
                    $q->withExists(['likes as liked_by_viewer' => fn ($q) => $q->where('user_id', $user->id)]);
                }
                return $q;
            },
            'reactions',
        ])->loadCount('likes');

        if ($user) {
            $question->setAttribute(
                'liked_by_viewer',
                $question->likes()->where('user_id', $user->id)->exists()
            );

            $question->setAttribute(
                'user_reaction',
                $question->reactions()->where('user_id', $user->id)->first()?->reaction
            );
        }

        return Inertia::render('Question/Show', [
            'question' => new QuestionResource($question),
        ]);
    }
}
