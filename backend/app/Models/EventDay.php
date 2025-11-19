<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventDay extends Model
{
    use HasFactory;

    protected $fillable = ['event_id', 'day_number', 'title'];

    protected $appends = ['results_count'];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function results()
    {
        return $this->hasMany(EventResult::class);
    }

    public function getResultsCountAttribute()
    {
        return $this->results()->count();
    }
}
