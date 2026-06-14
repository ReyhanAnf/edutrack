<?php

namespace App\Http\Controllers;

use App\Events\QuestionReactionToggled;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QuestionReactionController extends Controller
{
    public function toggle(Request $request, Question $question): JsonResponse|RedirectResponse
    {
        $request->validate([
            'reaction' => 'required|string|max:50',
        ]);

        $user = Auth::user();
        $reactionType = $request->reaction;
        $userReaction = $reactionType;

        $existingReaction = $question->reactions()->where('user_id', $user->id)->first();

        if ($existingReaction) {
            if ($existingReaction->reaction === $reactionType) {
                $existingReaction->delete();
                $userReaction = null;
            } else {
                $existingReaction->update(['reaction' => $reactionType]);
            }
        } else {
            $question->reactions()->create([
                'user_id' => $user->id,
                'reaction' => $reactionType,
            ]);
        }

        QuestionReactionToggled::dispatch($question);

        if ($request->wantsJson()) {
            $reactions = $question->reactions()
                ->select('reaction', DB::raw('count(*) as count'))
                ->groupBy('reaction')
                ->get()
                ->pluck('count', 'reaction');

            return response()->json([
                'user_reaction' => $userReaction,
                'reactions' => $reactions,
            ]);
        }

        return back();
    }
}
