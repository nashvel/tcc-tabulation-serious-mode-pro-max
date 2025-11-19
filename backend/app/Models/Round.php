<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Round extends Model
{
    protected $fillable = ['spot', 'name'];

    public function criteria()
    {
        return $this->hasMany(Criteria::class);
    }

    public function points()
    {
        return $this->hasMany(Point::class);
    }
}
