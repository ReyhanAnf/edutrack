<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'quiz_id' => $this->quiz_id,
            'title' => $this->title,
            'body' => $this->body,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'source_type' => $this->source_type,
            'status' => $this->status,
            'ai_hint' => $this->ai_hint,
            'brainliest_answer_id' => $this->brainliest_answer_id,
            'answers_count' => $this->whenCounted('answers'),
            'likes_count' => $this->whenCounted('likes'),
            'liked_by_viewer' => (bool) $this->when(isset($this->liked_by_viewer), $this->liked_by_viewer, false),
            'user_reaction' => $this->when(isset($this->user_reaction), $this->user_reaction),
            'reactions_summary' => $this->whenLoaded('reactions', function () {
                return $this->reactions->groupBy('reaction')->map->count();
            }),
            'created_at' => $this->created_at,
            'last_activity_at' => $this->last_activity_at,
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'profile_photo_url' => $this->user?->profile_photo_url,
            ],
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'answers' => $this->whenLoaded('answers', fn () => AnswerResource::collection($this->answers)->resolve()),
        ];
    }
}
