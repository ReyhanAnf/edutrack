<?php

namespace App\Http\Controllers;

use App\Events\AnswerLikeToggled;
use App\Models\Answer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AnswerLikeController extends Controller
{
    public function toggle(Answer $answer): JsonResponse|RedirectResponse
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

        $answer->loadCount('likes');

        AnswerLikeToggled::dispatch($answer, $userId, $liked);

        if (request()->wantsJson()) {
            return response()->json([
                'liked' => $liked,
                'likes_count' => $answer->likes_count,
            ]);
        }

        return back();
    }
}
