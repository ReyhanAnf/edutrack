<?php

namespace App\Domains\ArtificialIntelligence\Actions;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\Subject;

class SaveGeneratedQuizAction
{
    public function execute(int $userId, int $subjectId, array $questionsData): Quiz
    {
        $subject = Subject::find($subjectId);
        $subjectName = $subject ? $subject->name : 'Subject';

        $isDiagnostic = collect($questionsData)->first()['is_diagnostic'] ?? false;
        
        $quiz = Quiz::create([
            'user_id' => $userId,
            'subject_id' => $subjectId,
            'title' => ($isDiagnostic ? "Kuis Diagnostik: " : "Quiz: ") . "$subjectName (" . now()->format('Y-m-d') . ")",
            'description' => $isDiagnostic 
                ? "Kuis umum untuk menguji pemahaman dasar Anda pada mata pelajaran ini (karena belum ada catatan/pertanyaan)."
                : "AI-generated quiz based on your notes and questions.",
            'is_public' => false,
        ]);

        foreach ($questionsData as $data) {
            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question_text' => $data['question'],
                'options' => $data['options'],
                'correct_answer_index' => $data['correct_index'],
                'explanation' => $data['explanation'] ?? null,
            ]);
        }

        return $quiz;
    }
}
