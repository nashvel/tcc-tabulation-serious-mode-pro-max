<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScoreUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $judge_id;
    public $candidate_id;
    public $criteria_id;
    public $points;
    public $event_id;
    public $batch_scores; // For batch updates

    /**
     * Create a new event instance.
     */
    public function __construct($judge_id, $candidate_id, $criteria_id, $points, $event_id, $batch_scores = null)
    {
        $this->judge_id = $judge_id;
        $this->candidate_id = $candidate_id;
        $this->criteria_id = $criteria_id;
        $this->points = $points;
        $this->event_id = $event_id;
        $this->batch_scores = $batch_scores;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('scores.' . $this->event_id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        $data = [
            'judge_id' => $this->judge_id,
            'candidate_id' => $this->candidate_id,
            'criteria_id' => $this->criteria_id,
            'points' => $this->points,
            'event_id' => $this->event_id,
        ];
        
        // Include batch scores if this is a batch update
        if ($this->batch_scores !== null) {
            $data['batch_scores'] = $this->batch_scores;
            $data['is_batch'] = true;
        }
        
        return $data;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ScoreUpdated';  // No dot prefix for public channels
    }
}
