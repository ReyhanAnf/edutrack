<?php

namespace App\Domains\ArtificialIntelligence\Services;

use App\Domains\ArtificialIntelligence\Contracts\QuizGeneratorInterface;
use Laravel\Ai\Ai;
use Illuminate\Support\Facades\Log;

class HttpQuizGenerator implements QuizGeneratorInterface
{
    public function generateFromContent(string $content, int $questionCount = 5, array $attachments = []): array
    {
        $defaultProvider = config('ai.default');
        $apiKey = config("ai.providers.$defaultProvider.key");

        if (!$apiKey && $defaultProvider !== 'ollama') {
            throw new \Exception("AI API Key untuk provider [$defaultProvider] belum diatur di file .env. Harap atur {$defaultProvider}_API_KEY.");
        }

        $systemPrompt = "You are an educational assistant. Generate a quiz with $questionCount multiple-choice questions based on the provided content. 
        Return ONLY a JSON array of objects. Each object must have:
        - 'question': The question text.
        - 'options': An array of 4 strings.
        - 'correct_index': Integer (0-3).
        - 'explanation': Brief explanation of the correct answer.";

        $text = $this->callAi($systemPrompt, $content, $attachments);
        
        // Clean markdown blocks if present
        $jsonContent = preg_replace('/^```json\s*|```$/m', '', $text);
        $decoded = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('AI Quiz JSON decoding failed: ' . json_last_error_msg() . '. Response: ' . $text);
            throw new \Exception("AI mengembalikan format yang tidak valid. Silakan coba lagi.");
        }

        return $decoded['questions'] ?? $decoded;
    }

    /**
     * Wrap AI call with timeout-aware error handling.
     */
    protected function callAi(string $systemPrompt, string $content, array $attachments): string
    {
        try {
            $response = \Laravel\Ai\agent($systemPrompt)
                ->prompt("Content: $content", $attachments, timeout: 180);

            return (string) $response;
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AI Quiz request timed out: ' . $e->getMessage());
            throw new \Exception("Server AI sedang sibuk. Silakan coba lagi dalam beberapa saat.");
        }
    }

    // Keeping dummy data as a private reference but not using it for production fallback
    protected function getDummyData(int $count): array
    {
        $dummy = [];
        for ($i = 1; $i <= $count; $i++) {
            $dummy[] = [
                'question' => "Sample Question $i based on content?",
                'options' => ["Option A", "Option B", "Option C", "Option D"],
                'correct_index' => 0,
                'explanation' => "This is a dummy explanation for question $i."
            ];
        }
        return $dummy;
    }
}
