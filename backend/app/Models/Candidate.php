<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;
    protected $fillable = [
        'event_id',
        'number',
        'name',
        'gender',
        'department',
        'participant_type',
        'order'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function partnership()
    {
        return $this->hasOne(CandidatePartnership::class);
    }

    public function points()
    {
        return $this->hasMany(Point::class);
    }
}
