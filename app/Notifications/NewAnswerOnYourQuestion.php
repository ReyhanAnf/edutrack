<?php

namespace App\Notifications;

use App\Models\Answer;
use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewAnswerOnYourQuestion extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Answer $answer
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'new_answer',
            'actor_id' => $this->answer->user_id,
            'actor_name' => $this->answer->user?->name ?? 'Someone',
            'question_id' => $this->answer->question_id,
            'question_title' => $this->answer->question?->title ?? '',
            'answer_id' => $this->answer->id,
            'message' => ($this->answer->user?->name ?? 'Someone') . ' menjawab pertanyaanmu.',
            'url' => '/questions/' . $this->answer->question_id . '#answer-' . $this->answer->id,
        ];
    }

    public function toWebPush($notifiable): array
    {
        return [
            'title' => 'Jawaban Baru',
            'body' => ($this->answer->user?->name ?? 'Someone') . ' menjawab: ' . ($this->answer->question?->title ?? ''),
            'icon' => '/logo.png',
            'tag' => 'answer-' . $this->answer->id,
            'url' => url('/questions/' . $this->answer->question_id . '#answer-' . $this->answer->id),
        ];
    }
}
