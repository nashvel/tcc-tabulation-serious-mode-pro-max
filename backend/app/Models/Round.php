<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Round extends Model
{
    use HasFactory;
    protected $fillable = ['event_id', 'spot', 'name'];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function criteria()
    {
        return $this->hasMany(Criteria::class);
    }

    public function points()
    {
        return $this->hasMany(Point::class);
    }
}
