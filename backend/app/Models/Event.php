<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'unique_id',
        'title',
        'year',
        'event_date',
        'description',
        'event_type',
        'number_of_judges',
        'status',
        'start_date',
        'end_date',
        'theme_id',
        'template_id',
    ];

    protected $with = ['days'];

    protected $casts = [
        'event_date' => 'date',
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

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

    public function rounds()
    {
        return $this->hasMany(Round::class);
    }

    public function judges()
    {
        return $this->hasMany(Judge::class);
    }

    public function importantPeople()
    {
        return $this->hasMany(EventImportantPerson::class);
    }

    public function theme()
    {
        return $this->belongsTo(EventTheme::class, 'theme_id');
    }

    public function template()
    {
        return $this->belongsTo(EventTemplate::class, 'template_id');
    }
}
