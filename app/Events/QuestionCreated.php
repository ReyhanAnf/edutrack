<?php

namespace App\Events;

use App\Models\Question;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QuestionCreated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Question $question
    ) {
        $this->question->loadMissing(['user', 'subject'])->loadCount(['answers', 'likes']);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('questions.timeline');
    }

    public function broadcastAs(): string
    {
        return 'question.created';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'question' => [
                'id' => $this->question->id,
                'title' => $this->question->title,
                'body' => $this->question->body,
                'status' => $this->question->status,
                'answers_count' => $this->question->answers_count,
                'likes_count' => $this->question->likes_count,
                'liked_by_viewer' => false,
                'created_at' => $this->question->created_at,
                'user' => [
                    'id' => $this->question->user?->id,
                    'name' => $this->question->user?->name,
                ],
                'subject' => $this->question->subject ? [
                    'id' => $this->question->subject->id,
                    'name' => $this->question->subject->name,
                    'color_code' => $this->question->subject->color_code,
                ] : null,
            ],
        ];
    }
}
