<?php

namespace App\Domains\Gamification\Actions;

use App\Models\User;
use App\Models\Mission;
use App\Models\UserMission;
use App\Domains\Gamification\Actions\AwardUserExpAction;

class UpdateMissionProgressAction
{
    public function __construct(
        protected AwardUserExpAction $awardUserExpAction,
        protected GetUserActivityStatsAction $statsAction
    ) {}

    public function execute(User $user): void
    {
        $missions = Mission::all();
        $totalActivity = array_sum($this->statsAction->execute($user));

        foreach ($missions as $mission) {
            $userMission = UserMission::firstOrCreate(
                ['user_id' => $user->id, 'mission_id' => $mission->id],
                ['progress' => 0]
            );

            if ($userMission->completed_at) {
                continue;
            }

            if ($mission->type === 'total_activity') {
                $userMission->progress = min($totalActivity, $mission->requirement);
                
                if ($userMission->progress >= $mission->requirement) {
                    $userMission->completed_at = now();
                    
                    // Award points (XP) - we need a global subject or a generic way to award global XP
                    // For now, let's use globalSubjectId 1 as a placeholder or implement a global award
                    $globalSubject = \App\Models\GlobalSubject::first();
                    if ($globalSubject) {
                        $this->awardUserExpAction->execute($user, $globalSubject->id, $mission->points_reward);
                    }
                }
                
                $userMission->save();
            }
        }
    }
}
