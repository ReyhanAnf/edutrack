<?php

namespace App\Domains\QuestionAnswer\Actions;

use App\Events\AnswerSubmitted;
use App\Models\Answer;
use App\Models\Question;
use App\Models\User;

class SubmitAnswerAction
{
    public function execute(Question $question, User $user, string $body): Answer
    {
        $answer = $question->answers()->create([
            'user_id' => $user->id,
            'body' => $body,
        ]);

        $question->forceFill([
            'last_activity_at' => now(),
        ])->save();

        AnswerSubmitted::dispatch($answer->load('user'));

        return $answer;
    }
}
