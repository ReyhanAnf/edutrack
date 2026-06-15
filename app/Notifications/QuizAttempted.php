<?php

namespace App\Notifications;

use App\Models\QuizAttempt;
use App\Models\Quiz;
use App\Notifications\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class QuizAttempted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Quiz $quiz,
        public string $attempterName,
        public int $attempterId,
        public int $score,
        public int $totalQuestions
    ) {}

    public function via($notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'quiz_attempted',
            'actor_id' => $this->attempterId,
            'actor_name' => $this->attempterName,
            'quiz_id' => $this->quiz->id,
            'quiz_title' => $this->quiz->title ?? 'Quiz',
            'score' => $this->score,
            'total_questions' => $this->totalQuestions,
            'message' => $this->attempterName . ' mengerjakan kuis "' . ($this->quiz->title ?? 'Quiz') . '" dengan skor ' . $this->score . '/' . $this->totalQuestions . '.',
            'url' => '/quizzes/' . $this->quiz->id . '/attempts',
        ];
    }

    public function toWebPush($notifiable): array
    {
        return [
            'title' => 'Kuis Dikerjakan',
            'body' => $this->attempterName . ' mendapat skor ' . $this->score . '/' . $this->totalQuestions . ' pada kuis "' . ($this->quiz->title ?? 'Quiz') . '".',
            'icon' => '/logo.png',
            'tag' => 'quiz-attempt-' . $this->quiz->id . '-' . $this->attempterId,
            'url' => url('/quizzes/' . $this->quiz->id . '/attempts'),
        ];
    }
}
