<?php

namespace App\Domains\ArtificialIntelligence\Actions;

use App\Domains\ArtificialIntelligence\Contracts\QuizGeneratorInterface;
use App\Models\Grade;
use App\Models\Note;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Support\Facades\Storage;

class GenerateQuizDataAction
{
    public function __construct(
        protected QuizGeneratorInterface $generator
    ) {}

    public function execute(int $userId, int $subjectId, int $count = 5, ?string $customPrompt = null, ?array $noteIds = null): array
    {
        $context = "";
        $isDiagnostic = false;

        $notesQuery = Note::where('user_id', $userId);

        if (!empty($noteIds)) {
            $notesQuery->whereIn('id', $noteIds);
        } else {
            $notesQuery->where('subject_id', $subjectId);
        }

        $notes = $notesQuery->with('attachments')->latest()
            ->limit(!empty($noteIds) ? count($noteIds) : 5)
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

        if ($customPrompt) {
            $context .= "PRIORITY USER INSTRUCTION/TOPIC:\n{$customPrompt}\n\n";
            $context .= "Use the following context materials (if any) to fulfill the above request:\n\n";
        }

        $attachments = [];
        foreach ($notes as $note) {
            $context .= "Note: {$note->title}\n{$note->content}\n\n";
            if ($note->image_path) {
                $attachments[] = Storage::disk('public')->path($note->image_path);
            }
            foreach ($note->attachments as $attachment) {
                $attachments[] = Storage::disk('public')->path($attachment->file_path);
            }
        }

        foreach ($questions as $question) {
            $context .= "Question: {$question->title}\n{$question->body}\n\n";
        }

        foreach ($grades as $grade) {
            $context .= "Grade Record: Activity '{$grade->activity_name}' with score {$grade->score}\n";
        }

        if (empty(trim($context))) {
            $subject = Subject::find($subjectId);
            $subjectName = $subject ? $subject->name : 'General Knowledge';
            $context = "General knowledge and curriculum for the subject: $subjectName";
            $isDiagnostic = true;
        }

        $questionsData = $this->generator->generateFromContent($context, $count, $attachments);

        if ($isDiagnostic && !empty($questionsData)) {
            foreach ($questionsData as &$q) {
                $q['is_diagnostic'] = true;
            }
        }

        return $questionsData;
    }
}
