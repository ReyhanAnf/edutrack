<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalSubject extends Model
{
    protected $fillable = ['name', 'color_code'];

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function userExps()
    {
        return $this->hasMany(UserSubjectExp::class);
    }
}
