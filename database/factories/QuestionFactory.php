<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'subject_id' => Subject::factory(),
            'title' => $this->faker->sentence(),
            'body' => $this->faker->paragraph(),
            'source_type' => 'manual',
            'status' => 'open',
            'last_activity_at' => now(),
        ];
    }
}
