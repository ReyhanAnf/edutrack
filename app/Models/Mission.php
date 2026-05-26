<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    protected $fillable = ['name', 'description', 'type', 'requirement', 'points_reward'];

    public function userMissions()
    {
        return $this->hasMany(UserMission::class);
    }
}
