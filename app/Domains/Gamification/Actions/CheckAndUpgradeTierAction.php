<?php

namespace App\Domains\Gamification\Actions;

use App\Models\UserSubjectExp;

class CheckAndUpgradeTierAction
{
    /**
     * Mengevaluasi apakah XP cukup untuk naik level
     *
     * @param UserSubjectExp $userSubject
     * @return bool True jika naik tier, False jika tidak
     */
    public function execute(UserSubjectExp $userSubject): bool
    {
        $currentTier = $userSubject->tier;
        $xp = $userSubject->xp;

        $newTier = $this->determineTier($xp);

        if ($newTier !== $currentTier) {
            $userSubject->tier = $newTier;
            $userSubject->save();
            return true;
        }

        return false;
    }

    private function determineTier(int $xp): string
    {
        if ($xp >= 5000) return 'Grandmaster';
        if ($xp >= 2000) return 'Master';
        if ($xp >= 1000) return 'Expert';
        if ($xp >= 300) return 'Apprentice';
        return 'Novice';
    }
}
