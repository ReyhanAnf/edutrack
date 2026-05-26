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
     * Menambahkan XP ke Subject spesifik pengguna
     *
     * @param User $user
     * @param int $subjectId
     * @param int $xpAmount
     * @return UserSubjectExp
     */
    public function execute(User $user, int $subjectId, int $xpAmount): UserSubjectExp
    {
        $userSubject = UserSubjectExp::firstOrCreate(
            ['user_id' => $user->id, 'subject_id' => $subjectId],
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
