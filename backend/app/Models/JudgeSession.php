<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JudgeSession extends Model
{
    protected $fillable = [
        'judge_id',
        'event_id',
        'chair_number',
        'session_token',
        'laptop_ip',
        'user_agent',
        'logged_in_at',
        'logged_out_at',
        'status',
        'metadata',
    ];

    protected $casts = [
        'logged_in_at' => 'datetime',
        'logged_out_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function judge()
    {
        return $this->belongsTo(Judge::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
