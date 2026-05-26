<?php

namespace App\Domains\QuestionAnswer\Actions;

use App\Events\QuestionResolved;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class MarkAsBrainliestAction
{
    public function execute(Question $question, Answer $answer): Question
    {
        $question = DB::transaction(function () use ($question, $answer) {
            $question->answers()->update(['is_brainliest' => false]);

            $answer->forceFill(['is_brainliest' => true])->save();

            $question->forceFill([
                'brainliest_answer_id' => $answer->id,
                'status' => 'resolved',
                'last_activity_at' => now(),
            ])->save();

            return $question->refresh();
        });

        QuestionResolved::dispatch($question);

        return $question;
    }
}
