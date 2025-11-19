<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VotingState extends Model
{
    use HasFactory;

    protected $table = 'voting_state';

    protected $fillable = [
        'event_id',
        'is_active',
        'is_locked',
        'active_session_id',
        'active_round_id',
        'active_round_name',
        'active_criteria',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_locked' => 'boolean',
        'active_criteria' => 'array',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function activeSession()
    {
        return $this->belongsTo(VotingSession::class, 'active_session_id');
    }

    public function activeRound()
    {
        return $this->belongsTo(Round::class, 'active_round_id');
    }
}
