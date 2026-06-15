<?php

namespace App\Notifications;

use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class FriendRequest extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $actorName,
        public int $actorId,
        public string $action, // 'sent' or 'accepted'
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        $message = match ($this->action) {
            'sent' => $this->actorName . ' mengirim permintaan pertemanan.',
            'accepted' => $this->actorName . ' menerima permintaan pertemananmu.',
            default => $this->actorName . ' berinteraksi dengan pertemananmu.',
        };

        return [
            'type' => match ($this->action) {
                'sent' => 'friend_request',
                'accepted' => 'friend_accepted',
                default => 'friend_request',
            },
            'actor_id' => $this->actorId,
            'actor_name' => $this->actorName,
            'action' => $this->action,
            'message' => $message,
            'url' => '/friends',
        ];
    }

    public function toWebPush($notifiable): array
    {
        $data = $this->toArray($notifiable);

        return [
            'title' => match ($this->action) {
                'sent' => 'Permintaan Pertemanan',
                'accepted' => 'Pertemanan Diterima',
                default => 'Pertemanan',
            },
            'body' => $data['message'],
            'icon' => '/logo.png',
            'tag' => 'friend-' . $this->action . '-' . $this->actorId,
            'url' => url('/friends'),
        ];
    }
}
