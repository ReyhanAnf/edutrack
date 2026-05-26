<?php

namespace Database\Seeders;

use App\Models\Mission;
use Illuminate\Database\Seeder;

class MissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $missions = [
            [
                'name' => 'Pemanasan Belajar',
                'description' => 'Capai total 5 aktivitas belajar untuk memulai.',
                'type' => 'total_activity',
                'requirement' => 5,
                'points_reward' => 50,
            ],
            [
                'name' => 'Pelajar Aktif',
                'description' => 'Capai total 20 aktivitas belajar.',
                'type' => 'total_activity',
                'requirement' => 20,
                'points_reward' => 200,
            ],
            [
                'name' => 'Master EduTrack',
                'description' => 'Capai total 50 aktivitas belajar.',
                'type' => 'total_activity',
                'requirement' => 50,
                'points_reward' => 500,
            ],
        ];

        foreach ($missions as $mission) {
            Mission::updateOrCreate(
                ['name' => $mission['name']],
                $mission
            );
        }
    }
}
