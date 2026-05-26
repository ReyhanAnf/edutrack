<?php

namespace App\Domains\Gamification\Actions;

use App\Models\Question;
use App\Models\Answer;

class CalculateExperiencePointAction
{
    /**
     * Menghitung XP berdasarkan bobot aktivitas
     *
     * @param string $activityType
     * @return int
     */
    public function execute(string $activityType): int
    {
        return match ($activityType) {
            'CREATE_QUESTION' => 5,
            'SUBMIT_ANSWER' => 15,
            'BRAINLIEST_ANSWER' => 50,
            'RECEIVE_UPVOTE' => 10,
            'RECEIVE_GENIUS_REACTION' => 20,
            default => 1,
        };
    }
}
