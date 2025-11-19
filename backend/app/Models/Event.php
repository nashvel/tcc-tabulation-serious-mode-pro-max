<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'year', 'status', 'start_date', 'end_date'];

    protected $with = ['days'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function days()
    {
        return $this->hasMany(EventDay::class)->orderBy('day_number');
    }

    public function results()
    {
        return $this->hasMany(EventResult::class);
    }

    public function overallWinners()
    {
        return $this->hasMany(EventOverallWinner::class);
    }
}
