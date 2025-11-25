<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventImportantPerson extends Model
{
    protected $table = 'event_important_persons';

    protected $fillable = [
        'event_id',
        'position',
        'name',
        'title',
        'description'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
