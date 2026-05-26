<?php

namespace App\Events;

use App\Models\Answer;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnswerLikeToggled implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Answer $answer,
        public int $userId,
        public bool $liked
    ) {
        $this->answer->loadCount('likes');
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('questions.'.$this->answer->question_id),
            new Channel('answers.'.$this->answer->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'answer.like.toggled';
    }
}
