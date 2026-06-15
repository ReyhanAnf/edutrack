<?php

namespace App\Domains\Gamification\Actions;

use App\Models\User;
use App\Models\Mission;
use App\Models\UserMission;
use App\Models\GlobalSubject;
use App\Domains\Gamification\Actions\AwardUserExpAction;

class UpdateMissionProgressAction
{
    const MISSION_SUBJECT_NAME = 'Misi';

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
                    
                    // Award XP to a dedicated "Misi" subject
                    $globalSubject = GlobalSubject::firstOrCreate(
                        ['name' => self::MISSION_SUBJECT_NAME],
                        ['description' => 'XP dari penyelesaian misi', 'color_code' => '#f59e0b']
                    );
                    $this->awardUserExpAction->execute($user, $globalSubject->id, $mission->points_reward);
                }
                
                $userMission->save();
            }
        }
    }
}
