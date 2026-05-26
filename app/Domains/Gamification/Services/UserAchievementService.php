<?php

namespace App\Domains\Gamification\Services;

use App\Models\User;
use App\Domains\Gamification\Actions\CalculateExperiencePointAction;
use App\Domains\Gamification\Actions\AwardUserExpAction;

class UserAchievementService
{
    public function __construct(
        protected CalculateExperiencePointAction $calculateExperiencePointAction,
        protected AwardUserExpAction $awardUserExpAction
    ) {}

    /**
     * @param User $user
     * @param int|null $subjectId
     * @param string $activityType 
     */
    public function handleActivity(User $user, ?int $subjectId, string $activityType)
    {
        // 1. Calculate XP based on activity
        $xpAmount = $this->calculateExperiencePointAction->execute($activityType);

        // 2. Award XP and check/upgrade tier
        if ($xpAmount > 0 && $subjectId !== null) {
            // Map personal subject_id to global_subject_id
            $subject = \App\Models\Subject::find($subjectId);
            $globalSubjectId = $subject?->global_subject_id;

            if ($globalSubjectId) {
                $this->awardUserExpAction->execute($user, $globalSubjectId, $xpAmount);
            }
        }
    }
}
