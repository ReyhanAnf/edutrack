<?php

namespace App\Http\Controllers;

use App\Domains\QuestionAnswer\Services\QuestionWorkflowService;
use App\Http\Requests\StoreAnswerRequest;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    public function store(
        StoreAnswerRequest $request,
        Question $question,
        QuestionWorkflowService $workflow
    ): RedirectResponse {
        $workflow->submitAnswer($question, Auth::user(), $request->validated('body'));

        return redirect()->route('questions.show', $question);
    }

    public function markBrainliest(
        Question $question,
        Answer $answer,
        QuestionWorkflowService $workflow
    ): RedirectResponse {
        abort_unless((int) $question->user_id === (int) Auth::id(), 403);
        abort_unless((int) $answer->question_id === (int) $question->id, 404);

        $workflow->markAsBrainliest($question, $answer);

        return redirect()->route('questions.show', $question);
    }
}
