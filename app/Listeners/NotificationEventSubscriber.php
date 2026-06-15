<?php

namespace App\Listeners;

use App\Events\AnswerLikeToggled;
use App\Events\AnswerSubmitted;
use App\Events\QuestionReactionToggled;
use App\Events\QuestionResolved;
use App\Notifications\AnswerMarkedBrainliest;
use App\Notifications\ContentLiked;
use App\Notifications\NewAnswerOnYourQuestion;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Facades\Auth;

class NotificationEventSubscriber
{
    public function handleAnswerSubmitted(AnswerSubmitted $event): void
    {
        $question = $event->answer->question;
        if (!$question) {
            return;
        }

        // Don't notify if the answerer is the question owner
        if ((int) $event->answer->user_id === (int) $question->user_id) {
            return;
        }

        $questionOwner = $question->user;
        if ($questionOwner) {
            $questionOwner->notify(new NewAnswerOnYourQuestion($event->answer));
        }
    }

    public function handleQuestionResolved(QuestionResolved $event): void
    {
        $question = $event->question;
        $brainliestAnswer = $question->answers()->where('is_brainliest', true)->first();

        if (!$brainliestAnswer) {
            return;
        }

        // Don't notify if the question owner marked their own answer
        if ((int) $brainliestAnswer->user_id === (int) $question->user_id) {
            return;
        }

        $answerOwner = $brainliestAnswer->user;
        if ($answerOwner) {
            $answerOwner->notify(new AnswerMarkedBrainliest($question, $brainliestAnswer));
        }
    }

    public function handleAnswerLikeToggled(AnswerLikeToggled $event): void
    {
        // Only notify on like (not unlike), and skip self-likes
        if (!$event->liked || (int) $event->answer->user_id === $event->userId) {
            return;
        }

        $answerOwner = $event->answer->user;
        $actor = \App\Models\User::find($event->userId);

        if ($answerOwner && $actor) {
            $answerOwner->notify(new ContentLiked(
                actorName: $actor->name,
                actorId: $event->userId,
                contentType: 'answer',
                contentId: $event->answer->id,
                contentTitle: $event->answer->body ? \Illuminate\Support\Str::limit($event->answer->body, 60) : 'Jawaban',
                reaction: 'like'
            ));
        }
    }

    public function handleQuestionReactionToggled(QuestionReactionToggled $event): void
    {
        $user = Auth::user();
        if (!$user || (int) $event->question->user_id === (int) $user->id) {
            return;
        }

        // Check if user still has a reaction (not removed)
        $hasReaction = $event->question->reactions()->where('user_id', $user->id)->exists();
        if (!$hasReaction) {
            return;
        }

        $questionOwner = $event->question->user;
        if ($questionOwner) {
            $questionOwner->notify(new ContentLiked(
                actorName: $user->name,
                actorId: $user->id,
                contentType: 'question',
                contentId: $event->question->id,
                contentTitle: $event->question->title ?? '',
                reaction: 'reaction'
            ));
        }
    }

    public function subscribe(Dispatcher $events): array
    {
        return [
            AnswerSubmitted::class => 'handleAnswerSubmitted',
            QuestionResolved::class => 'handleQuestionResolved',
            AnswerLikeToggled::class => 'handleAnswerLikeToggled',
            QuestionReactionToggled::class => 'handleQuestionReactionToggled',
        ];
    }
}
