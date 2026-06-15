<?php

namespace App\Events;

use App\Models\Answer;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class AnswerSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Answer $answer
    ) {
        $this->answer->loadMissing('user');
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('questions.'.$this->answer->question_id),
            new Channel('questions.timeline'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'answer.submitted';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'answer' => [
                'id' => $this->answer->id,
                'question_id' => $this->answer->question_id,
                'body' => Str::limit($this->answer->body, 500),
                'is_brainliest' => $this->answer->is_brainliest,
                'is_ai_verified' => $this->answer->is_ai_verified,
                'created_at' => $this->answer->created_at,
                'user' => [
                    'id' => $this->answer->user?->id,
                    'name' => $this->answer->user?->name,
                ],
            ],
        ];
    }
}
