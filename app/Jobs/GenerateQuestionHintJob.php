<?php

namespace App\Jobs;

use App\Domains\ArtificialIntelligence\Actions\GenerateStepByStepHintAction;
use App\Models\Question;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateQuestionHintJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Question $question
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GenerateStepByStepHintAction $action): void
    {
        $action->execute($this->question);
    }
}
