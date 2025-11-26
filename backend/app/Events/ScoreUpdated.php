<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScoreUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $judge_id;
    public $candidate_id;
    public $criteria_id;
    public $points;
    public $event_id;

    /**
     * Create a new event instance.
     */
    public function __construct($judge_id, $candidate_id, $criteria_id, $points, $event_id)
    {
        $this->judge_id = $judge_id;
        $this->candidate_id = $candidate_id;
        $this->criteria_id = $criteria_id;
        $this->points = $points;
        $this->event_id = $event_id;
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
        return [
            'judge_id' => $this->judge_id,
            'candidate_id' => $this->candidate_id,
            'criteria_id' => $this->criteria_id,
            'points' => $this->points,
            'event_id' => $this->event_id,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ScoreUpdated';  // No dot prefix for public channels
    }
}
