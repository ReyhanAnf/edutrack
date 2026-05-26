<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyArena extends Model
{
    protected $fillable = ['created_by', 'subject_id', 'room_name', 'mode', 'is_active'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
