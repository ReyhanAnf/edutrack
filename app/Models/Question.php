<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject_id',
        'title',
        'body',
        'image_path',
        'source_type',
        'status',
        'ai_hint',
        'brainliest_answer_id',
        'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'last_activity_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(QuestionLike::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(QuestionReaction::class);
    }

    public function brainliestAnswer(): BelongsTo
    {
        return $this->belongsTo(Answer::class, 'brainliest_answer_id');
    }
}
