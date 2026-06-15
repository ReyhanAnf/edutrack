<?php

namespace App\Notifications;

use App\Models\Question;
use App\Models\Answer;
use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AnswerMarkedBrainliest extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Question $question,
        public Answer $answer
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'brainliest',
            'actor_id' => $this->question->user_id,
            'actor_name' => $this->question->user?->name ?? 'Someone',
            'question_id' => $this->question->id,
            'question_title' => $this->question->title ?? '',
            'answer_id' => $this->answer->id,
            'message' => ($this->question->user?->name ?? 'Someone') . ' memilih jawabanmu sebagai yang terbaik!',
            'url' => '/questions/' . $this->question->id . '#answer-' . $this->answer->id,
        ];
    }

    public function toWebPush($notifiable): array
    {
        return [
            'title' => 'Jawaban Terbaik!',
            'body' => 'Jawabanmu pada "' . ($this->question->title ?? '') . '" dipilih sebagai yang terbaik.',
            'icon' => '/logo.png',
            'tag' => 'brainliest-' . $this->answer->id,
            'url' => url('/questions/' . $this->question->id . '#answer-' . $this->answer->id),
        ];
    }
}
