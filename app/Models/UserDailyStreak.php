<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDailyStreak extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'qna_done',
        'quiz_done',
        'status',
        'is_rewarded',
    ];

    protected $casts = [
        'date' => 'date',
        'qna_done' => 'boolean',
        'quiz_done' => 'boolean',
        'is_rewarded' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
