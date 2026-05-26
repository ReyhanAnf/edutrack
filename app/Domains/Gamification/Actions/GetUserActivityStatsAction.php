<?php

namespace App\Domains\Gamification\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GetUserActivityStatsAction
{
    public function execute(User $user, int $days = 365): array
    {
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        $stats = [];

        // 1. Notes
        $notes = $user->notes()
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get();

        // 2. Questions
        $questions = $user->questions()
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get();

        // 3. Answers
        $answers = $user->answers()
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get();

        // 4. Quiz Attempts
        $attempts = $user->attempts()
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get();

        // 5. Attendances
        $attendances = $user->attendances()
            ->where('date', '>=', $startDate)
            ->select('date', DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get();

        // Combine all
        $this->mergeStats($stats, $notes);
        $this->mergeStats($stats, $questions);
        $this->mergeStats($stats, $answers);
        $this->mergeStats($stats, $attempts);
        $this->mergeStats($stats, $attendances);

        return $stats;
    }

    protected function mergeStats(array &$stats, $items): void
    {
        foreach ($items as $item) {
            $date = $item->date;
            if (isset($stats[$date])) {
                $stats[$date] += $item->count;
            } else {
                $stats[$date] = $item->count;
            }
        }
    }
}
