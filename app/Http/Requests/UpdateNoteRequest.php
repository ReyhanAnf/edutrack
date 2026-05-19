<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
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
            'subject_id' => [
                'nullable',
                \Illuminate\Validation\Rule::exists('subjects', 'id')->where(function ($query) {
                    $query->where('user_id', \Illuminate\Support\Facades\Auth::id());
                }),
            ],
        ];
    }
}
