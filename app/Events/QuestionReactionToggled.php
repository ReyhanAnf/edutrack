<?php

namespace App\Events;

use App\Models\Question;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class QuestionReactionToggled implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Question $question
    ) {
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
        return 'question.reaction.toggled';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $reactions = $this->question->reactions()
            ->select('reaction', DB::raw('count(*) as count'))
            ->groupBy('reaction')
            ->get()
            ->pluck('count', 'reaction')
            ->toArray();

        return [
            'question_id' => $this->question->id,
            'reactions' => $reactions,
        ];
    }
}
