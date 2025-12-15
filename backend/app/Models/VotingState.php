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
        'show_judge_numbers',
        'active_session_id',
        'active_round_id',
        'active_criteria',
        'occupied_judges',
        'display_settings',
        'registered_screens',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_locked' => 'boolean',
        'show_judge_numbers' => 'boolean',
        'active_criteria' => 'array',
        'occupied_judges' => 'array',
        'display_settings' => 'array',
        'registered_screens' => 'array',
    ];

    /**
     * Get default display settings
     */
    public static function getDefaultDisplaySettings(): array
    {
        return [
            'show_candidate_name' => true,
            'show_team_department' => true,
            'judge_login_mode' => 'auto', // 'auto' | 'manual'
        ];
    }

    /**
     * Get display settings with defaults
     */
    public function getDisplaySettingsWithDefaults(): array
    {
        return array_merge(self::getDefaultDisplaySettings(), $this->display_settings ?? []);
    }

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
