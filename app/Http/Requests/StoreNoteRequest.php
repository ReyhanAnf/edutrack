<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'content' => 'required|string',
            'status' => 'required|in:In Progress,Completed',
            'is_favorite' => 'nullable|boolean',
            'image' => 'nullable|image|max:2048', // Keep for backwards compatibility
            'attachments' => 'nullable|array|max:10', // Max 10 attachments
            'attachments.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,pdf|max:10240', // Max 10MB per file
            'subject_id' => [
                'nullable',
                \Illuminate\Validation\Rule::exists('subjects', 'id')->where(function ($query) {
                    $query->where('user_id', \Illuminate\Support\Facades\Auth::id());
                }),
            ],
        ];
    }
}
