<?php

namespace App\Http\Controllers;

use App\Events\QuestionLikeToggled;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class QuestionLikeController extends Controller
{
    public function toggle(Question $question): RedirectResponse
    {
        $user = Auth::user();

        $like = $question->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            $question->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        $question->loadCount('likes');

        QuestionLikeToggled::dispatch($question, $user->id, $liked);

        return back();
    }
}
