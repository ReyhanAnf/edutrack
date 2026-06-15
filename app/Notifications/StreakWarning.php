<?php

namespace App\Notifications;

use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class StreakWarning extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $currentStreak
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'streak_warning',
            'current_streak' => $this->currentStreak,
            'message' => 'Api kamu hampir padam! Selesaikan aktivitas hari ini untuk menjaga streak ' . $this->currentStreak . ' hari.',
            'url' => '/dashboard',
        ];
    }

    public function toWebPush($notifiable): array
    {
        return [
            'title' => 'Api Hampir Padam!',
            'body' => 'Streak ' . $this->currentStreak . ' hari terancam! Selesaikan aktivitas belajar hari ini.',
            'icon' => '/logo.png',
            'tag' => 'streak-warning',
            'url' => url('/dashboard'),
        ];
    }
}
