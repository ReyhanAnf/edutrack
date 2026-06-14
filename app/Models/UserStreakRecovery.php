<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStreakRecovery extends Model
{
    protected $fillable = [
        'user_id',
        'lost_date',
        'previous_streak_count',
        'recovery_type',
        'quizzes_required',
        'quizzes_completed',
        'status',
    ];

    protected $casts = [
        'lost_date' => 'date',
        'previous_streak_count' => 'integer',
        'quizzes_required' => 'integer',
        'quizzes_completed' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
