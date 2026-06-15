<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserDailyStreak;
use App\Notifications\StreakWarning;
use Carbon\Carbon;
use Illuminate\Console\Command;

class StreakWarningCommand extends Command
{
    protected $signature = 'gamification:streak-warning';
    protected $description = 'Send streak warning notifications to users with active streaks who haven\'t done activity today.';

    public function handle(): int
    {
        $today = Carbon::today()->toDateString();

        // Find users who have a "full" streak yesterday (or recent days)
        // but haven't done any activity today
        $users = User::where('is_active', true)
            ->whereHas('pushSubscriptions') // Only users with push subs (or DB notifs)
            ->get()
            ->filter(function ($user) use ($today) {
                // Check if user has activity today
                $todayRecord = UserDailyStreak::where('user_id', $user->id)
                    ->where('date', $today)
                    ->first();

                // If today has full status, no warning needed
                if ($todayRecord && $todayRecord->status === 'full') {
                    return false;
                }

                // Check if user has an active streak (consecutive full days before today)
                $streakCount = 0;
                $date = Carbon::today()->subDay();

                while (true) {
                    $record = UserDailyStreak::where('user_id', $user->id)
                        ->where('date', $date->toDateString())
                        ->first();

                    if (!$record || $record->status !== 'full') {
                        break;
                    }

                    $streakCount++;
                    $date->subDay();
                }

                // Only warn if they have at least 1 day streak
                return $streakCount > 0;
            });

        $count = 0;
        foreach ($users as $user) {
            // Calculate current streak count
            $streakCount = 0;
            $date = Carbon::today()->subDay();
            while (true) {
                $record = UserDailyStreak::where('user_id', $user->id)
                    ->where('date', $date->toDateString())
                    ->first();
                if (!$record || $record->status !== 'full') break;
                $streakCount++;
                $date->subDay();
            }

            $user->notify(new StreakWarning($streakCount));
            $count++;
        }

        $this->info("Sent streak warnings to {$count} users.");
        return 0;
    }
}
