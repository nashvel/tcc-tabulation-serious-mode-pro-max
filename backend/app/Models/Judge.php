<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Judge extends Model
{
    use HasFactory;
    protected $fillable = [
        'event_id',
        'name',
        'email',
        'chair_number',
        'laptop_ip',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function sessions()
    {
        return $this->hasMany(JudgeSession::class);
    }

    public function points()
    {
        return $this->hasMany(Point::class);
    }
}
