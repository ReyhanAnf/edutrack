<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q', '');
        $subjectId = $request->query('subject_id', 'all');
        $status = $request->query('status', 'all'); // all, answered, unanswered
        $sort = $request->query('sort', 'relevance'); // relevance, latest, popular
        
        $questions = [];
        $users = [];

        if (strlen(trim($q)) > 0) {
            $user = Auth::user();
            
            // 1. Multi-word match parsing
            $words = array_filter(explode(' ', trim($q)));

            $questionQuery = Question::query()
                ->with(['user', 'subject', 'brainliestAnswer.user'])
                ->withCount('answers')
                ->withCount('likes');

            if ($user) {
                $questionQuery->withExists(['likes as liked_by_viewer' => fn ($query) => $query->where('user_id', $user->id)]);
            }

            // Apply Keyword filter
            if (!empty($words)) {
                $questionQuery->where(function($query) use ($words) {
                    foreach ($words as $word) {
                        $query->where(function($q2) use ($word) {
                            $q2->where('title', 'like', "%{$word}%")
                               ->orWhere('body', 'like', "%{$word}%");
                        });
                    }
                });
            }

            // Apply Subject filter
            if ($subjectId !== 'all' && is_numeric($subjectId)) {
                $questionQuery->where('subject_id', $subjectId);
            }

            // Apply Status filter
            if ($status === 'answered') {
                $questionQuery->has('answers');
            } elseif ($status === 'unanswered') {
                $questionQuery->doesntHave('answers');
            }

            // Apply Sorting
            if ($sort === 'latest') {
                $questionQuery->latest();
            } elseif ($sort === 'popular') {
                $questionQuery->orderByDesc('answers_count')->orderByDesc('likes_count')->latest();
            } else {
                // Relevance Sorting
                $rawScore = "0";
                $qSafe = DB::getPdo()->quote("%{$q}%");
                $rawScore .= " + (CASE WHEN title LIKE {$qSafe} THEN 10 ELSE 0 END)";
                foreach ($words as $word) {
                    $wSafe = DB::getPdo()->quote("%{$word}%");
                    $rawScore .= " + (CASE WHEN title LIKE {$wSafe} THEN 2 ELSE 0 END)";
                    $rawScore .= " + (CASE WHEN body LIKE {$wSafe} THEN 1 ELSE 0 END)";
                }
                
                $questionQuery->orderByRaw("($rawScore) DESC")->latest();
            }

            $questions = $questionQuery->limit(50)->get()->map(function ($question) use ($user) {
                return [
                    'id' => $question->id,
                    'title' => $question->title,
                    'body' => $question->body,
                    'answers_count' => $question->answers_count,
                    'likes_count' => $question->likes_count,
                    'created_at' => $question->created_at,
                    'subject' => $question->subject ? [
                        'id' => $question->subject->id,
                        'name' => $question->subject->name,
                        'color_code' => $question->subject->color_code,
                    ] : null,
                    'user' => [
                        'id' => $question->user?->id,
                        'name' => $question->user?->name,
                    ],
                    'answer_preview' => $question->brainliestAnswer?->body ?? null,
                    'answer_author' => $question->brainliestAnswer?->user?->name ?? null,
                ];
            });

            // Users Search
            $userQuery = User::query();
            foreach ($words as $word) {
                $userQuery->where('name', 'like', "%{$word}%");
            }
            $users = $userQuery->limit(20)
                ->get()
                ->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'profile_photo_url' => $u->profile_photo_url,
                    'institution' => $u->institution,
                ]);
        }

        $subjects = Subject::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Search/Index', [
            'query' => $q,
            'filters' => [
                'subject_id' => $subjectId,
                'status' => $status,
                'sort' => $sort,
            ],
            'questions' => $questions,
            'users' => $users,
            'subjects' => $subjects,
        ]);
    }
}
