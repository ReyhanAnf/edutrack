<?php

namespace App\Notifications;

use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class LeaderboardOvertaken extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $overtakerName,
        public int $overtakerId,
        public string $subjectName,
        public int $previousRank,
        public int $newRank
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'leaderboard_overtaken',
            'actor_id' => $this->overtakerId,
            'actor_name' => $this->overtakerName,
            'subject_name' => $this->subjectName,
            'previous_rank' => $this->previousRank,
            'new_rank' => $this->newRank,
            'message' => $this->overtakerName . ' menyalip peringkatmu di leaderboard ' . $this->subjectName . '. Kamu turun ke peringkat #' . $this->newRank . '.',
            'url' => '/leaderboard',
        ];
    }

    public function toWebPush($notifiable): array
    {
        return [
            'title' => 'Peringkat Tergeser!',
            'body' => $this->overtakerName . ' menyalipmu di leaderboard ' . $this->subjectName . '. Sekarang kamu di peringkat #' . $this->newRank . '.',
            'icon' => '/logo.png',
            'tag' => 'leaderboard-' . $this->subjectName,
            'url' => url('/leaderboard'),
        ];
    }
}
