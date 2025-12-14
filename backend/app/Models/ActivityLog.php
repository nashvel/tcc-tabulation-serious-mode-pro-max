<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'judge_id',
        'action',
        'entity_type',
        'entity_id',
        'details',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    // Action constants
    const ACTION_SCORE_ENTERED = 'score_entered';
    const ACTION_SCORE_UPDATED = 'score_updated';
    const ACTION_JUDGE_LOGIN = 'judge_login';
    const ACTION_JUDGE_LOGOUT = 'judge_logout';
    const ACTION_ROUND_ACTIVATED = 'round_activated';
    const ACTION_VOTING_LOCKED = 'voting_locked';
    const ACTION_VOTING_UNLOCKED = 'voting_unlocked';
    const ACTION_SCORES_CLEARED = 'scores_cleared';

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function judge()
    {
        return $this->belongsTo(Judge::class);
    }

    // Helper to create log entry
    public static function log($eventId, $action, $details = [], $judgeId = null, $request = null)
    {
        return self::create([
            'event_id' => $eventId,
            'judge_id' => $judgeId,
            'action' => $action,
            'entity_type' => isset($details['entity_type']) ? $details['entity_type'] : null,
            'entity_id' => isset($details['entity_id']) ? $details['entity_id'] : null,
            'details' => $details,
            'ip_address' => $request ? $request->ip() : null,
            'user_agent' => $request ? $request->userAgent() : null,
        ]);
    }

    // Get human-readable action description
    public function getDescriptionAttribute()
    {
        $judge = $this->judge;
        $judgeId = $this->judge_id ? $this->judge_id : 'Unknown';
        $judgeName = $judge ? $judge->name : ('Judge #' . $judgeId);
        $details = $this->details ? $this->details : [];

        $candidateName = isset($details['candidate_name']) ? $details['candidate_name'] : 'candidate';
        $criteriaName = isset($details['criteria_name']) ? $details['criteria_name'] : 'criteria';
        $points = isset($details['points']) ? $details['points'] : 0;
        $oldPoints = isset($details['old_points']) ? $details['old_points'] : 0;
        $newPoints = isset($details['new_points']) ? $details['new_points'] : 0;
        $roundName = isset($details['round_name']) ? $details['round_name'] : 'Unknown';

        switch ($this->action) {
            case self::ACTION_SCORE_ENTERED:
                return "{$judgeName} scored {$candidateName} - {$criteriaName}: {$points} pts";
            case self::ACTION_SCORE_UPDATED:
                return "{$judgeName} updated score for {$candidateName}: {$oldPoints} → {$newPoints}";
            case self::ACTION_JUDGE_LOGIN:
                return "{$judgeName} logged in";
            case self::ACTION_JUDGE_LOGOUT:
                return "{$judgeName} logged out";
            case self::ACTION_ROUND_ACTIVATED:
                return "Round '{$roundName}' activated";
            case self::ACTION_VOTING_LOCKED:
                return "Voting locked by admin";
            case self::ACTION_VOTING_UNLOCKED:
                return "Voting unlocked by admin";
            case self::ACTION_SCORES_CLEARED:
                return "All scores cleared by admin";
            default:
                return $this->action;
        }
    }
}
