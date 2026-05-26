<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnswerLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'answer_id',
        'user_id',
    ];

    public function answer(): BelongsTo
    {
        return $this->belongsTo(Answer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
