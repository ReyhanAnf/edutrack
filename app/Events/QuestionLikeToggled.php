<?php

namespace App\Events;

use App\Models\Question;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QuestionLikeToggled implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Question $question,
        public int $userId,
        public bool $liked
    ) {
        $this->question->loadCount('likes');
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('questions.timeline'),
            new Channel('questions.'.$this->question->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'question.like.toggled';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'question' => [
                'id' => $this->question->id,
                'likes_count' => $this->question->likes_count,
            ],
            'user_id' => $this->userId,
            'liked' => $this->liked,
        ];
    }
}
