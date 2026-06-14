<?php

namespace App\Domains\ArtificialIntelligence\Actions;

use App\Models\Question;
use Laravel\Ai\Ai;
use Illuminate\Support\Facades\Log;

class GenerateStepByStepHintAction
{
    public function execute(Question $question): void
    {
        $subjectName = $question->subject?->name ?? 'this subject';
        
        $systemPrompt = "Kamu adalah tutor ahli dalam mata pelajaran $subjectName. 
        Saat siswa bertanya, JANGAN berikan jawaban langsung. 
        Sebaliknya, berikan 3-4 petunjuk bertahap yang membantu siswa menemukan jawabannya sendiri.
        Format responsmu dengan rapi menggunakan langkah-langkah seperti 'Petunjuk 1', 'Petunjuk 2', dll.
        Jika pertanyaannya kurang jelas, tanyakan kembali untuk klarifikasi.
        PENTING: Selalu gunakan Bahasa Indonesia yang baik, ramah, dan memotivasi siswa.";

        $userPrompt = "Title: {$question->title}\n\nQuestion Body: {$question->body}";

        $keys = [
            env('GEMINI_API_KEY_1'),
            env('GEMINI_API_KEY_2'),
            env('GEMINI_API_KEY_3'),
        ];

        $success = false;

        foreach ($keys as $index => $key) {
            if (empty($key)) {
                continue;
            }

            try {
                \Illuminate\Support\Facades\Config::set('ai.providers.gemini.key', $key);

                $response = \Laravel\Ai\agent($systemPrompt)
                    ->prompt($userPrompt);

                $question->update([
                    'ai_hint' => (string) $response,
                ]);

                Log::info("AI Hint generated for Question #{$question->id} using Key " . ($index + 1));
                $success = true;
                break; // Stop trying if successful
            } catch (\Exception $e) {
                Log::warning("AI Hint generation failed with Key " . ($index + 1) . " for Question #{$question->id}: " . $e->getMessage());
            }
        }

        if (! $success) {
            Log::error("All AI API Keys failed for Question #{$question->id}.");
            $question->update([
                'ai_hint' => "Mohon maaf, layanan AI saat ini sedang reload. Silakan diskusi dengan komunitas sementara waktu.",
            ]);
        }
    }
}
