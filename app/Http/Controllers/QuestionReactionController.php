<?php

namespace App\Http\Controllers;

use App\Events\QuestionReactionToggled;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionReactionController extends Controller
{
    public function toggle(Request $request, Question $question): RedirectResponse
    {
        $request->validate([
            'reaction' => 'required|string|max:50',
        ]);

        $user = Auth::user();
        $reactionType = $request->reaction;

        $existingReaction = $question->reactions()->where('user_id', $user->id)->first();

        if ($existingReaction) {
            if ($existingReaction->reaction === $reactionType) {
                $existingReaction->delete();
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

        return back();
    }
}
