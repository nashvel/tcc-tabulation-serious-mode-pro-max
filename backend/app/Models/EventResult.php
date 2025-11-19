<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'event_day_id',
        'category',
        'rank',
        'participant_name',
        'college',
        'score'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function eventDay()
    {
        return $this->belongsTo(EventDay::class);
    }
}
