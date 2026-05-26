<?php

namespace App\Domains\ArtificialIntelligence\Contracts;

interface QuizGeneratorInterface
{
    /**
     * Generate quiz questions from the given content.
     *
     * @param string $content
     * @param int $questionCount
     * @return array Array of questions with options, correct index, and explanation.
     */
    public function generateFromContent(string $content, int $questionCount = 5): array;
}
