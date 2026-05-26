<?php

namespace App\Domains\QuestionAnswer\Actions;

use App\Events\QuestionCreated;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Arr;

class CreateQuestionAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data): Question
    {
        $question = $user->questions()->create([
            ...Arr::only($data, ['subject_id', 'title', 'body', 'image_path']),
            'source_type' => $data['source_type'] ?? 'text',
            'last_activity_at' => now(),
        ]);

        QuestionCreated::dispatch($question);

        return $question;
    }
}
