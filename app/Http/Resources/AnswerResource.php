<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnswerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'body' => $this->body,
            'is_brainliest' => $this->is_brainliest,
            'is_ai_verified' => $this->is_ai_verified,
            'likes_count' => $this->whenCounted('likes'),
            'liked_by_viewer' => (bool) $this->when(isset($this->liked_by_viewer), $this->liked_by_viewer, false),
            'created_at' => $this->created_at,
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ],
        ];
    }
}
