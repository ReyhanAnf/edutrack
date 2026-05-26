<?php

namespace App\Domains\ArtificialIntelligence\Actions;

use App\Domains\ArtificialIntelligence\Contracts\QuizGeneratorInterface;
use App\Models\Grade;
use App\Models\Note;
use App\Models\Question;
use App\Models\Subject;

class GenerateQuizDataAction
{
    public function __construct(
        protected QuizGeneratorInterface $generator
    ) {}

    public function execute(int $userId, int $subjectId, int $count = 5): array
    {
        $notes = Note::where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->latest()
            ->limit(5)
            ->get();

        $questions = Question::where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->latest()
            ->limit(5)
            ->get();

        $grades = Grade::where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->latest()
            ->limit(5)
            ->get();

        $context = "";

        foreach ($notes as $note) {
            $context .= "Note: {$note->title}\n{$note->content}\n\n";
        }

        foreach ($questions as $question) {
            $context .= "Question: {$question->title}\n{$question->body}\n\n";
        }

        foreach ($grades as $grade) {
            $context .= "Grade Record: Activity '{$grade->activity_name}' with score {$grade->score}\n";
        }

        $isDiagnostic = false;
        if (empty($context)) {
            $subject = Subject::find($subjectId);
            $subjectName = $subject ? $subject->name : 'General Knowledge';
            $context = "General knowledge and curriculum for the subject: $subjectName";
            $isDiagnostic = true;
        }

        $questionsData = $this->generator->generateFromContent($context, $count);

        if ($isDiagnostic && !empty($questionsData)) {
            foreach ($questionsData as &$q) {
                $q['is_diagnostic'] = true;
            }
        }

        return $questionsData;
    }
}
