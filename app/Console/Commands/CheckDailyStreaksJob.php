<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserDailyStreak;
use App\Models\UserStreakRecovery;
use Carbon\Carbon;

class CheckDailyStreaksJob extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gamification:check-streaks {date?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check daily streaks and create recovery tasks for missed streaks.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dateStr = $this->argument('date');
        $checkDate = $dateStr ? Carbon::parse($dateStr) : Carbon::yesterday();

        $users = User::all();

        foreach ($users as $user) {
            $streak = UserDailyStreak::where('user_id', $user->id)
                ->where('date', $checkDate->toDateString())
                ->first();

            $status = $streak ? $streak->status : 'none';

            if ($status !== 'full') {
                $previousStreakCount = 0;
                $tempDate = $checkDate->copy()->subDay();
                
                while (true) {
                    $record = UserDailyStreak::where('user_id', $user->id)
                        ->where('date', $tempDate->toDateString())
                        ->first();
                        
                    if (!$record || $record->status !== 'full') {
                        break;
                    }
                    
                    $previousStreakCount++;
                    $tempDate->subDay();
                }

                if ($previousStreakCount > 0) {
                    // Create Recovery Task only if they had a streak to recover
                    UserStreakRecovery::updateOrCreate(
                        [
                            'user_id' => $user->id, 
                            'lost_date' => $checkDate->toDateString(),
                            'status' => 'pending' // Only recreate if still pending
                        ],
                        [
                            'previous_streak_count' => $previousStreakCount,
                            'recovery_type' => $status === 'half' ? 'half_missed' : 'full_missed',
                            'quizzes_required' => $status === 'half' ? 5 : 10,
                        ]
                    );
                }
            }
        }

        $this->info("Streak check completed for " . $checkDate->toDateString());
    }
}
