<?php

namespace App\Listeners;

use App\Domains\Gamification\Services\UserAchievementService;
use App\Domains\Gamification\Actions\UpdateMissionProgressAction;
use App\Events\AnswerSubmitted;
use App\Events\QuestionCreated;
use App\Events\QuestionResolved;
use App\Events\QuestionLikeToggled;
use App\Events\AnswerLikeToggled;
use Illuminate\Events\Dispatcher;

class GamificationEventSubscriber
{
    public function __construct(
        protected UserAchievementService $achievementService,
        protected \App\Domains\Gamification\Services\UserStreakService $streakService,
        protected UpdateMissionProgressAction $updateMissionProgressAction
    ) {}

    public function handleQuestionCreated(QuestionCreated $event): void
    {
        // Generate AI hint in the background
        \App\Jobs\GenerateQuestionHintJob::dispatch($event->question);

        $this->achievementService->handleActivity(
            $event->question->user,
            $event->question->subject_id,
            'CREATE_QUESTION'
        );

        $this->streakService->recordActivity($event->question->user, 'qna');
        $this->updateMissionProgressAction->execute($event->question->user);
    }

    public function handleAnswerSubmitted(AnswerSubmitted $event): void
    {
        $this->achievementService->handleActivity(
            $event->answer->user,
            $event->answer->question->subject_id,
            'SUBMIT_ANSWER'
        );

        $this->streakService->recordActivity($event->answer->user, 'qna');
        $this->updateMissionProgressAction->execute($event->answer->user);
    }

    public function handleQuestionResolved(QuestionResolved $event): void
    {
        // Give points to the user who received the brainliest answer
        $brainliestAnswer = $event->question->answers()->where('is_brainliest', true)->first();
        if ($brainliestAnswer) {
            $this->achievementService->handleActivity(
                $brainliestAnswer->user,
                $event->question->subject_id,
                'BRAINLIEST_ANSWER'
            );
        }
    }

    public function handleQuestionLikeToggled(QuestionLikeToggled $event): void
    {
        if ($event->liked && $event->question->user_id !== $event->userId) {
            // Reward the author of the question
            $this->achievementService->handleActivity(
                $event->question->user,
                $event->question->subject_id,
                'RECEIVE_UPVOTE'
            );
        }
    }

    public function handleAnswerLikeToggled(AnswerLikeToggled $event): void
    {
        if ($event->liked && $event->answer->user_id !== $event->userId) {
            // Reward the author of the answer
            $this->achievementService->handleActivity(
                $event->answer->user,
                $event->answer->question->subject_id,
                'RECEIVE_UPVOTE'
            );
        }
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            QuestionCreated::class => 'handleQuestionCreated',
            AnswerSubmitted::class => 'handleAnswerSubmitted',
            QuestionResolved::class => 'handleQuestionResolved',
            QuestionLikeToggled::class => 'handleQuestionLikeToggled',
            AnswerLikeToggled::class => 'handleAnswerLikeToggled',
        ];
    }
}
