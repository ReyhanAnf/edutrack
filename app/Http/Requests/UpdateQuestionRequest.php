<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->question->user_id === Auth::id();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where(fn ($query) => $query->where('user_id', Auth::id())),
            ],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:10'],
            'image' => ['nullable', 'image', 'max:5120'], // Max 5MB
        ];
    }
}
