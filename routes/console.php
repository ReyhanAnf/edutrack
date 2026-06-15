<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Streak checks
Schedule::command('gamification:check-streaks')->dailyAt('00:05');
Schedule::command('gamification:streak-warning')->dailyAt('20:00');
