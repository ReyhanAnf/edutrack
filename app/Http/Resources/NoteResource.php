<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'title' => $this->title,
            'category' => $this->category,
            'content' => $this->content,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'attachments' => $this->whenLoaded('attachments', function () {
                return $this->attachments->map(function ($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_url' => asset('storage/'.$attachment->file_path),
                        'file_name' => $attachment->file_name,
                        'file_type' => $attachment->file_type,
                        'file_size' => $attachment->file_size,
                    ];
                });
            }),
            'status' => $this->status,
            'is_favorite' => $this->is_favorite,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
