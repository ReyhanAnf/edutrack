<?php

namespace App\Notifications;

use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TierUpgraded extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $subjectName,
        public string $newTier,
        public int $xp,
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'tier_upgraded',
            'message' => "Kamu naik ke {$this->newTier} di {$this->subjectName}!",
            'new_tier' => $this->newTier,
            'subject_name' => $this->subjectName,
            'url' => '/leaderboard',
        ];
    }

    public function toWebPush($notifiable): array
    {
        return [
            'title' => 'Naik Level!',
            'body' => "Selamat! Kamu naik ke {$this->newTier} di {$this->subjectName}.",
            'icon' => '/logo.png',
            'tag' => 'tier-upgrade',
            'url' => url('/leaderboard'),
        ];
    }
}
