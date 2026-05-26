<?php

namespace App\Http\Controllers;

use App\Events\AnswerLikeToggled;
use App\Models\Answer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AnswerLikeController extends Controller
{
    public function toggle(Answer $answer): RedirectResponse
    {
        $userId = Auth::id();
        $like = $answer->likes()->where('user_id', $userId)->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            $answer->likes()->create(['user_id' => $userId]);
            $liked = true;
        }

        AnswerLikeToggled::dispatch($answer, $userId, $liked);

        return back();
    }
}
