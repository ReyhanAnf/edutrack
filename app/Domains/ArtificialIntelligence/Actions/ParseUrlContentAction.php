<?php

namespace App\Domains\ArtificialIntelligence\Actions;

use Laravel\Ai\Ai;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ParseUrlContentAction
{
    public function execute(string $url): array
    {
        try {
            // Simple fetching of content. In a real app, you'd use a more robust scraper/headless browser.
            $response = Http::get($url);
            
            if (!$response->successful()) {
                throw new \Exception("Could not fetch URL: " . $url);
            }

            $html = $response->body();
            // Basic extraction of text from HTML (very crude)
            $text = strip_tags($html);
            $text = substr($text, 0, 4000); // Limit context size

            $systemPrompt = "You are a content curator. Summarize the following web page content into 3-5 key educational points that would stimulate discussion in a student social learning network.
            Return a JSON object with:
            - 'title': A catchy title for the post.
            - 'summary': A 2-sentence summary of the page.
            - 'key_points': An array of strings (the educational points).";

            $aiResponse = \Laravel\Ai\agent($systemPrompt)
                ->prompt("URL: $url\n\nContent:\n$text");

            $jsonContent = preg_replace('/^```json\s*|```$/m', '', (string) $aiResponse);
            $decoded = json_decode($jsonContent, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("JSON decoding failed: " . json_last_error_msg());
            }

            return $decoded;

        } catch (\Exception $e) {
            Log::error("Failed to parse URL content for AI: " . $e->getMessage());
            return [
                'error' => true,
                'message' => 'Failed to parse content.',
            ];
        }
    }
}
