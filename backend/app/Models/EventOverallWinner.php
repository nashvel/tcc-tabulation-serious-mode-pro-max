<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventOverallWinner extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'title',
        'winner_name',
        'college',
        'year_level'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
