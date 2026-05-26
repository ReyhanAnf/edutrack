<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bounty extends Model
{
    protected $fillable = ['question_id', 'xp_amount', 'is_active'];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
