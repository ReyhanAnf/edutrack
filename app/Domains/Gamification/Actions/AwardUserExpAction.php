<?php

namespace App\Domains\Gamification\Actions;

use App\Models\User;
use App\Models\UserSubjectExp;
use App\Models\GlobalSubject;
use App\Domains\Gamification\Actions\CheckAndUpgradeTierAction;
use App\Notifications\LeaderboardOvertaken;

class AwardUserExpAction
{
    protected CheckAndUpgradeTierAction $checkAndUpgradeTierAction;

    public function __construct(CheckAndUpgradeTierAction $checkAndUpgradeTierAction)
    {
        $this->checkAndUpgradeTierAction = $checkAndUpgradeTierAction;
    }

    public function execute(User $user, int $globalSubjectId, int $xpAmount): UserSubjectExp
    {
        $userSubject = UserSubjectExp::firstOrCreate(
            ['user_id' => $user->id, 'global_subject_id' => $globalSubjectId],
            ['xp' => 0, 'tier' => 'Novice']
        );

        // Get rank before XP update
        $rankBefore = $this->getRank($globalSubjectId, $user->id);

        $userSubject->xp += $xpAmount;
        $userSubject->save();

        // Cek apakah perlu naik level
        $this->checkAndUpgradeTierAction->execute($userSubject);

        // Get rank after XP update
        $rankAfter = $this->getRank($globalSubjectId, $user->id);

        // If the user's rank improved (rank number decreased), notify the user who got overtaken
        if ($rankBefore > 0 && $rankAfter > 0 && $rankAfter < $rankBefore) {
            $this->notifyOvertakenUsers($user, $globalSubjectId, $rankBefore, $rankAfter);
        }

        return $userSubject;
    }

    protected function getRank(int $globalSubjectId, int $userId): int
    {
        $userXp = UserSubjectExp::where('user_id', $userId)
            ->where('global_subject_id', $globalSubjectId)
            ->value('xp') ?? 0;

        // Count users with more XP (their rank is higher)
        return UserSubjectExp::where('global_subject_id', $globalSubjectId)
            ->where('xp', '>', $userXp)
            ->count() + 1;
    }

    protected function notifyOvertakenUsers(User $overtaker, int $globalSubjectId, int $oldRank, int $newRank): void
    {
        // For each rank position the overtaker gained, find who was displaced
        $globalSubject = GlobalSubject::find($globalSubjectId);
        if (!$globalSubject) return;

        // Only notify for top 50 ranks to keep it lightweight
        if ($newRank > 50) return;

        // Find users who were at the overtaker's new rank positions (they moved down)
        $overtakerXp = UserSubjectExp::where('user_id', $overtaker->id)
            ->where('global_subject_id', $globalSubjectId)
            ->value('xp') ?? 0;

        // Get users just below the overtaker (they got displaced by 1 position)
        $displacedUsers = UserSubjectExp::where('global_subject_id', $globalSubjectId)
            ->where('user_id', '!=', $overtaker->id)
            ->where('xp', '<', $overtakerXp)
            ->where('xp', '>=', $overtakerXp - 500) // Within ~500 XP range
            ->with('user')
            ->orderBy('xp', 'desc')
            ->limit($oldRank - $newRank) // Only the positions gained
            ->get();

        foreach ($displacedUsers as $displaced) {
            if (!$displaced->user) continue;

            $displacedNewRank = $this->getRank($globalSubjectId, $displaced->user_id);

            // Only notify if their rank actually decreased
            if ($displacedNewRank > $newRank) {
                $displaced->user->notify(new LeaderboardOvertaken(
                    overtakerName: $overtaker->name,
                    overtakerId: $overtaker->id,
                    subjectName: $globalSubject->name,
                    previousRank: $displacedNewRank - 1,
                    newRank: $displacedNewRank,
                ));
            }
        }
    }
}
