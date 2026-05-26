<?php

namespace Tests\Feature;

use App\Domains\ArtificialIntelligence\Contracts\QuizGeneratorInterface;
use App\Models\Note;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class QuizGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_generate_quiz_from_subject_content()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create(['name' => 'Mathematics']);

        // Create some content
        Note::factory()->create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'title' => 'Calculus Note',
            'content' => 'Derivatives and Integrals are core of calculus.'
        ]);

        Question::factory()->create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'title' => 'Calculus Problem',
            'body' => 'What is the derivative of x^2?'
        ]);

        // Mock the AI generator
        $this->mock(QuizGeneratorInterface::class, function (MockInterface $mock) {
            $mock->shouldReceive('generateFromContent')
                ->once()
                ->andReturn([
                    [
                        'question' => 'What is the derivative of x^2?',
                        'options' => ['x', '2x', 'x^2', '2'],
                        'correct_index' => 1,
                        'explanation' => 'Power rule: d/dx x^n = nx^(n-1)'
                    ]
                ]);
        });

        $response = $this->actingAs($user)
            ->postJson('/api/quizzes/generate', [
                'subject_id' => $subject->id,
                'count' => 1
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Quiz generated successfully');

        $this->assertDatabaseHas('quizzes', [
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'title' => 'Quiz: Mathematics (' . now()->format('Y-m-d') . ')'
        ]);

        $this->assertDatabaseHas('quiz_questions', [
            'question_text' => 'What is the derivative of x^2?',
            'correct_answer_index' => 1
        ]);
    }

    public function test_user_can_toggle_quiz_visibility()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        $quiz = \App\Models\Quiz::create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'title' => 'Private Quiz',
            'is_public' => false
        ]);

        $response = $this->actingAs($user)
            ->postJson("/api/quizzes/{$quiz->id}/toggle-public");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_public', true);

        $this->assertTrue($quiz->fresh()->is_public);
    }
}
