<?php

namespace Database\Seeders;

use App\Models\GlobalSubject;
use Illuminate\Database\Seeder;

class GlobalSubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Matematika', 'color_code' => '#3b82f6'],
            ['name' => 'Bahasa Indonesia', 'color_code' => '#ef4444'],
            ['name' => 'Bahasa Inggris', 'color_code' => '#f97316'],
            ['name' => 'IPA', 'color_code' => '#22c55e'],
            ['name' => 'IPS', 'color_code' => '#eab308'],
            ['name' => 'PKN', 'color_code' => '#a855f7'],
            ['name' => 'Penjaskes', 'color_code' => '#06b6d4'],
            ['name' => 'Seni Budaya', 'color_code' => '#ec4899'],
            ['name' => 'TIK', 'color_code' => '#6366f1'],
            ['name' => 'Agama', 'color_code' => '#64748b'],
        ];

        foreach ($subjects as $subject) {
            GlobalSubject::firstOrCreate(
                ['name' => $subject['name']],
                ['color_code' => $subject['color_code']]
            );
        }
    }
}
