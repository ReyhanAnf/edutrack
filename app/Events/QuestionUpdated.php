<?php

namespace App\Events;

use App\Models\Question;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class QuestionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Question $question
    ) {
        $this->question->loadMissing(['user', 'subject'])->loadCount(['answers', 'likes']);
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('questions.timeline'),
            new Channel('questions.'.$this->question->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'question.updated';
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
                'body' => Str::limit($this->question->body, 500),
                'status' => $this->question->status,
                'image_url' => $this->question->image_path ? asset('storage/'.$this->question->image_path) : null,
                'answers_count' => $this->question->answers_count,
                'likes_count' => $this->question->likes_count,
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
