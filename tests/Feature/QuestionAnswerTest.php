<?php

use App\Models\Answer;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;

test('authenticated user can create a question', function () {
    $user = User::factory()->create();
    $subject = Subject::factory()->for($user)->create();

    $response = $this
        ->actingAs($user)
        ->post(route('questions.store'), [
            'subject_id' => $subject->id,
            'title' => 'Bagaimana menyelesaikan persamaan kuadrat?',
            'body' => 'Saya bingung menentukan langkah awal untuk menyelesaikan persamaan kuadrat ini.',
        ]);

    $question = Question::query()->first();

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('questions.show', $question));

    $this->assertDatabaseHas('questions', [
        'user_id' => $user->id,
        'subject_id' => $subject->id,
        'source_type' => 'text',
        'status' => 'open',
    ]);
});

test('authenticated user can answer a question', function () {
    $asker = User::factory()->create();
    $answerer = User::factory()->create();
    $question = Question::query()->create([
        'user_id' => $asker->id,
        'title' => 'Apa itu hukum Newton kedua?',
        'body' => 'Saya perlu memahami hubungan gaya, massa, dan percepatan.',
        'source_type' => 'text',
        'last_activity_at' => now(),
    ]);

    $response = $this
        ->actingAs($answerer)
        ->post(route('questions.answers.store', $question), [
            'body' => 'Hukum Newton kedua menjelaskan bahwa percepatan benda sebanding dengan gaya total.',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('questions.show', $question));

    $this->assertDatabaseHas('answers', [
        'question_id' => $question->id,
        'user_id' => $answerer->id,
        'is_brainliest' => false,
    ]);
});

test('question owner can mark an answer as brainliest', function () {
    $asker = User::factory()->create();
    $answerer = User::factory()->create();
    $question = Question::query()->create([
        'user_id' => $asker->id,
        'title' => 'Kenapa fotosintesis perlu cahaya?',
        'body' => 'Saya ingin memahami peran cahaya dalam proses fotosintesis.',
        'source_type' => 'text',
        'last_activity_at' => now(),
    ]);
    $answer = Answer::query()->create([
        'question_id' => $question->id,
        'user_id' => $answerer->id,
        'body' => 'Cahaya menyediakan energi untuk mengubah karbon dioksida dan air menjadi glukosa.',
    ]);

    $response = $this
        ->actingAs($asker)
        ->patch(route('questions.answers.brainliest', [$question, $answer]));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('questions.show', $question));

    expect($question->refresh()->status)->toBe('resolved')
        ->and($question->brainliest_answer_id)->toBe($answer->id)
        ->and($answer->refresh()->is_brainliest)->toBeTrue();
});

test('authenticated user can toggle question like', function () {
    $asker = User::factory()->create();
    $viewer = User::factory()->create();
    $question = Question::query()->create([
        'user_id' => $asker->id,
        'title' => 'Apa maksud gaya gesek?',
        'body' => 'Saya ingin memahami contoh gaya gesek dalam kehidupan sehari-hari.',
        'source_type' => 'text',
        'last_activity_at' => now(),
    ]);

    $likeResponse = $this
        ->actingAs($viewer)
        ->postJson(route('questions.likes.toggle', $question));

    $likeResponse
        ->assertOk()
        ->assertJson([
            'liked' => true,
            'likes_count' => 1,
        ]);

    $this->assertDatabaseHas('question_likes', [
        'question_id' => $question->id,
        'user_id' => $viewer->id,
    ]);

    $unlikeResponse = $this
        ->actingAs($viewer)
        ->postJson(route('questions.likes.toggle', $question));

    $unlikeResponse
        ->assertOk()
        ->assertJson([
            'liked' => false,
            'likes_count' => 0,
        ]);

    $this->assertDatabaseMissing('question_likes', [
        'question_id' => $question->id,
        'user_id' => $viewer->id,
    ]);
});

test('authenticated user can toggle question reaction with json response', function () {
    $asker = User::factory()->create();
    $viewer = User::factory()->create();
    $question = Question::query()->create([
        'user_id' => $asker->id,
        'title' => 'Apa maksud energi kinetik?',
        'body' => 'Saya ingin memahami contoh energi kinetik.',
        'source_type' => 'text',
        'last_activity_at' => now(),
    ]);

    $reactionResponse = $this
        ->actingAs($viewer)
        ->postJson(route('questions.reactions.toggle', $question), [
            'reaction' => 'lightbulb',
        ]);

    $reactionResponse
        ->assertOk()
        ->assertJson([
            'user_reaction' => 'lightbulb',
            'reactions' => [
                'lightbulb' => 1,
            ],
        ]);

    $removeResponse = $this
        ->actingAs($viewer)
        ->postJson(route('questions.reactions.toggle', $question), [
            'reaction' => 'lightbulb',
        ]);

    $removeResponse
        ->assertOk()
        ->assertJson([
            'user_reaction' => null,
            'reactions' => [],
        ]);
});

test('authenticated user can toggle answer like with json response', function () {
    $asker = User::factory()->create();
    $answerer = User::factory()->create();
    $viewer = User::factory()->create();
    $question = Question::query()->create([
        'user_id' => $asker->id,
        'title' => 'Kenapa air mendidih?',
        'body' => 'Saya ingin memahami perubahan wujud air.',
        'source_type' => 'text',
        'last_activity_at' => now(),
    ]);
    $answer = Answer::query()->create([
        'question_id' => $question->id,
        'user_id' => $answerer->id,
        'body' => 'Air mendidih saat tekanan uapnya sama dengan tekanan lingkungan.',
    ]);

    $likeResponse = $this
        ->actingAs($viewer)
        ->postJson(route('answers.likes.toggle', $answer));

    $likeResponse
        ->assertOk()
        ->assertJson([
            'liked' => true,
            'likes_count' => 1,
        ]);
});
