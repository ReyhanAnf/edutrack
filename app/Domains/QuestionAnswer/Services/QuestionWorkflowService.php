<?php

namespace App\Domains\QuestionAnswer\Services;

use App\Domains\QuestionAnswer\Actions\CreateQuestionAction;
use App\Domains\QuestionAnswer\Actions\MarkAsBrainliestAction;
use App\Domains\QuestionAnswer\Actions\SubmitAnswerAction;
use App\Models\Answer;
use App\Models\Question;
use App\Models\User;

class QuestionWorkflowService
{
    public function __construct(
        private readonly CreateQuestionAction $createQuestion,
        private readonly SubmitAnswerAction $submitAnswer,
        private readonly MarkAsBrainliestAction $markAsBrainliest,
    ) {
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createTextQuestion(User $user, array $data): Question
    {
        return $this->createQuestion->execute($user, [
            ...$data,
            'source_type' => 'text',
        ]);
    }

    public function submitAnswer(Question $question, User $user, string $body): Answer
    {
        return $this->submitAnswer->execute($question, $user, $body);
    }

    public function markAsBrainliest(Question $question, Answer $answer): Question
    {
        return $this->markAsBrainliest->execute($question, $answer);
    }
}
