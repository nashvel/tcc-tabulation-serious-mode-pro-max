<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $fillable = ['number', 'name', 'gender'];

    public function points()
    {
        return $this->hasMany(Point::class);
    }
}
