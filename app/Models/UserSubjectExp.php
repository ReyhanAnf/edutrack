<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSubjectExp extends Model
{
    protected $fillable = ['user_id', 'global_subject_id', 'xp', 'tier'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function globalSubject()
    {
        return $this->belongsTo(GlobalSubject::class);
    }
}
