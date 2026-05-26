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
        
        $systemPrompt = "You are an expert tutor in $subjectName. 
        When a student asks a question, do NOT give the direct answer. 
        Instead, provide 3-4 progressive hints that help the student arrive at the answer themselves.
        Format your response as a clear, step-by-step guide with 'Hint 1', 'Hint 2', etc.
        If the question is unclear, ask clarifying questions instead.";

        $userPrompt = "Title: {$question->title}\n\nQuestion Body: {$question->body}";

        try {
            $response = \Laravel\Ai\agent($systemPrompt)
                ->prompt($userPrompt);

            $question->update([
                'ai_hint' => (string) $response,
            ]);

            Log::info("AI Hint generated for Question #{$question->id}");
        } catch (\Exception $e) {
            Log::error("Failed to generate AI hint for Question #{$question->id}: " . $e->getMessage());
        }
    }
}
