<?php

namespace Database\Seeders;

use App\Models\{
    Assignment,
    Grade,
    Note,
    Schedule,
    Subject,
    User,
    Attendance
};
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::create([
            'name' => 'Reyhan Andrea Firdaus',
            'email' => '19240133@bsi.ac.id',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $user2 = User::create([
            'name' => 'Ramadhani Ilham Bintang',
            'email' => '19240321@bsi.ac.id',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $user3 = User::create([
            'name' => 'Nabilah Sri Mulyani',
            'email' => '19241268@bsi.ac.id',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $user4 = User::create([
            'name' => 'AlGhifari',
            'email' => '19241333@bsi.ac.id',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // $subjects = Subject::factory(6)->create([
        //     'user_id' => $user->id,
        // ]);

        // foreach ($subjects as $subject) {
        //     Assignment::factory(3)->create([
        //         'user_id' => $user->id,
        //         'subject_id' => $subject->id,
        //     ]);

        //     Schedule::factory(2)->create([
        //         'user_id' => $user->id,
        //         'subject_id' => $subject->id,
        //     ]);

        //     Grade::factory(4)->create([
        //         'user_id' => $user->id,
        //         'subject_id' => $subject->id,
        //     ]);

        //     Attendance::factory(5)->create([
        //         'user_id' => $user->id,
        //         'subject_id' => $subject->id,
        //     ]);
        // }

        // Note::factory(5)->create([
        //     'user_id' => $user->id,
        //     'subject_id' => $subjects->random()->id,
        // ]);

        // Note::factory(3)->create([
        //     'user_id' => $user->id,
        //     'subject_id' => null,
        //     'category' => 'General',
        // ]);
    }
}
