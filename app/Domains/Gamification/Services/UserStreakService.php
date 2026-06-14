<?php

namespace App\Domains\Gamification\Services;

use App\Models\User;
use App\Models\UserDailyStreak;
use App\Models\UserStreakRecovery;
use App\Models\GlobalSubject;
use App\Models\UserSubjectExp;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserStreakService
{
    /**
     * Constants for XP reward
     */
    const REWARD_XP = 1000;
    const GLOBAL_SUBJECT_NAME = 'Aktivitas Streak';

    public function recordActivity(User $user, string $activityType)
    {
        $today = Carbon::today();
        
        $streak = UserDailyStreak::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            [
                'qna_done' => false,
                'quiz_done' => false,
                'status' => 'none',
                'is_rewarded' => false,
            ]
        );

        $updated = false;

        if ($activityType === 'qna' && !$streak->qna_done) {
            $streak->qna_done = true;
            $updated = true;
        } elseif ($activityType === 'quiz') {
            // Kita ijinkan quiz dipanggil berkali-kali untuk menambah progress recovery
            if (!$streak->quiz_done) {
                $streak->quiz_done = true;
                $updated = true;
            }
            $this->progressRecoveryQuiz($user);
        }

        if ($updated) {
            if ($streak->qna_done && $streak->quiz_done) {
                $streak->status = 'full';
            } elseif ($streak->qna_done || $streak->quiz_done) {
                $streak->status = 'half';
            }
            $streak->save();

            $this->checkAndRewardStreak($user);
        }
    }

    public function getConsecutiveStreaks(User $user): int
    {
        // Hitung streak full berurutan dari kemarin ke belakang, 
        // ditambah hari ini jika hari ini full.
        $count = 0;
        $date = Carbon::today();
        
        while (true) {
            $record = UserDailyStreak::where('user_id', $user->id)
                ->where('date', $date->toDateString())
                ->first();
                
            if (!$record || $record->status !== 'full') {
                // Berhenti menghitung jika bukan full, 
                // KECUALI jika ini hari ini dan belum full, maka cek kemarin
                if ($date->isToday()) {
                    $date->subDay();
                    continue;
                }
                break;
            }
            $count++;
            $date->subDay();
        }
        return $count;
    }

    protected function checkAndRewardStreak(User $user)
    {
        $todayStreak = UserDailyStreak::where('user_id', $user->id)
            ->where('date', Carbon::today())
            ->first();

        // Hanya cek reward jika hari ini full dan belum di-reward
        if ($todayStreak && $todayStreak->status === 'full' && !$todayStreak->is_rewarded) {
            $currentStreakCount = $this->getConsecutiveStreaks($user);
            
            // Jika kelipatan 5 hari beruntun
            if ($currentStreakCount > 0 && $currentStreakCount % 5 === 0) {
                $this->awardStreakExp($user);
                $todayStreak->update(['is_rewarded' => true]);
            }
        }
    }

    protected function awardStreakExp(User $user)
    {
        $globalSubject = GlobalSubject::firstOrCreate(
            ['name' => self::GLOBAL_SUBJECT_NAME],
            ['description' => 'Mata pelajaran khusus untuk penghargaan streak harian', 'icon_path' => null]
        );

        $userExp = UserSubjectExp::firstOrCreate(
            ['user_id' => $user->id, 'global_subject_id' => $globalSubject->id],
            ['xp' => 0, 'tier' => 'Novice']
        );

        $userExp->xp += self::REWARD_XP;
        $userExp->save();
        
        // checkAndUpgradeTierAction dipanggil disini secara ideal, tapi kita buat simple dulu
    }

    protected function progressRecoveryQuiz(User $user)
    {
        $pendingRecovery = UserStreakRecovery::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($pendingRecovery) {
            $pendingRecovery->quizzes_completed += 1;
            
            if ($pendingRecovery->quizzes_completed >= $pendingRecovery->quizzes_required) {
                $this->executeRecovery($pendingRecovery);
            } else {
                $pendingRecovery->save();
            }
        }
    }

    public function payForRecovery(UserStreakRecovery $recovery): bool
    {
        if ($recovery->status !== 'pending') {
            return false;
        }

        $globalSubject = GlobalSubject::where('name', self::GLOBAL_SUBJECT_NAME)->first();
        if (!$globalSubject) return false;

        $userExp = UserSubjectExp::where('user_id', $recovery->user_id)
            ->where('global_subject_id', $globalSubject->id)
            ->first();

        if (!$userExp) return false;

        $cost = $this->calculateRecoveryCost($recovery);

        if ($userExp->xp >= $cost) {
            $userExp->xp -= $cost;
            $userExp->save();
            $this->executeRecovery($recovery);
            return true;
        }

        return false;
    }

    public function calculateRecoveryCost(UserStreakRecovery $recovery): int
    {
        $base = floor($recovery->previous_streak_count / 5) * 1000;
        return $recovery->recovery_type === 'half_missed' ? (int)($base / 4) : (int)($base / 2);
    }

    protected function executeRecovery(UserStreakRecovery $recovery)
    {
        DB::transaction(function () use ($recovery) {
            // Update recovery status
            $recovery->update(['status' => 'success']);

            // Update user_daily_streaks to full for the lost date
            UserDailyStreak::updateOrCreate(
                ['user_id' => $recovery->user_id, 'date' => $recovery->lost_date],
                ['status' => 'full', 'qna_done' => true, 'quiz_done' => true]
            );
        });
    }
}
