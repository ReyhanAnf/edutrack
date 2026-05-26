<?php

namespace App\Domains\Gamification\Actions;

use App\Models\Question;
use App\Models\Bounty;

class CreateBountyAction
{
    /**
     * Mengunci XP tambahan untuk pertanyaan sulit
     *
     * @param Question $question
     * @param int $xpAmount
     * @return Bounty
     */
    public function execute(Question $question, int $xpAmount): Bounty
    {
        // Cancel active bounties first if needed, or simply add new
        return Bounty::create([
            'question_id' => $question->id,
            'xp_amount' => $xpAmount,
            'is_active' => true,
        ]);
    }
}
