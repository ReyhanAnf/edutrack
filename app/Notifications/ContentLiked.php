<?php

namespace App\Notifications;

use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ContentLiked extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $actorName,
        public int $actorId,
        public string $contentType,
        public int $contentId,
        public string $contentTitle,
        public string $reaction = 'like'
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        $actionLabel = $this->reaction === 'like' ? 'menyukai' : 'bereaksi pada';
        $contentTypeLabel = match ($this->contentType) {
            'question' => 'pertanyaanmu',
            'answer' => 'jawabanmu',
            default => 'kontenmu',
        };

        $url = match ($this->contentType) {
            'question' => '/questions/' . $this->contentId,
            'answer' => '/questions/' . $this->contentId . '#answer-' . $this->contentId,
            default => '/questions/' . $this->contentId,
        };

        return [
            'type' => 'content_liked',
            'actor_id' => $this->actorId,
            'actor_name' => $this->actorName,
            'content_type' => $this->contentType,
            'content_id' => $this->contentId,
            'content_title' => $this->contentTitle,
            'reaction' => $this->reaction,
            'message' => $this->actorName . ' ' . $actionLabel . ' ' . $contentTypeLabel . '.',
            'url' => $url,
        ];
    }

    public function toWebPush($notifiable): array
    {
        $data = $this->toArray($notifiable);
        return [
            'title' => $this->reaction === 'like' ? 'Suka' : 'Reaksi',
            'body' => $data['message'] . ' "' . $this->contentTitle . '"',
            'icon' => '/logo.png',
            'tag' => $this->contentType . '-' . $this->contentId . '-like',
            'url' => url($data['url']),
        ];
    }
}
