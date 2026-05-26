<?php

namespace App\Domains\Gamification\Actions;

use App\Models\User;
use App\Models\UserSubjectExp;
use App\Domains\Gamification\Actions\CheckAndUpgradeTierAction;

class AwardUserExpAction
{
    protected CheckAndUpgradeTierAction $checkAndUpgradeTierAction;

    public function __construct(CheckAndUpgradeTierAction $checkAndUpgradeTierAction)
    {
        $this->checkAndUpgradeTierAction = $checkAndUpgradeTierAction;
    }

    /**
     * Menambahkan XP ke Global Subject spesifik pengguna
     *
     * @param User $user
     * @param int $globalSubjectId
     * @param int $xpAmount
     * @return UserSubjectExp
     */
    public function execute(User $user, int $globalSubjectId, int $xpAmount): UserSubjectExp
    {
        $userSubject = UserSubjectExp::firstOrCreate(
            ['user_id' => $user->id, 'global_subject_id' => $globalSubjectId],
            ['xp' => 0, 'tier' => 'Novice']
        );

        $userSubject->xp += $xpAmount;
        $userSubject->save();

        // Cek apakah perlu naik level
        $this->checkAndUpgradeTierAction->execute($userSubject);

        // Optional: tambahkan juga XP global atau overall ranking bisa diambil dari sum(xp).

        return $userSubject;
    }
}
