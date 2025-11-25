<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VotingStateChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public $eventId;
    public $votingState;
    public $action; // 'started', 'stopped', 'round_changed', 'locked', 'unlocked'

    public function __construct($eventId, $votingState, $action = 'updated')
    {
        $this->eventId = $eventId;
        $this->votingState = $votingState;
        $this->action = $action;
        // Broadcast to everyone including the sender
        // (no dontBroadcastToCurrentUser call)
    }

    public function broadcastOn(): array
    {
        return [
            new \Illuminate\Broadcasting\Channel('voting.' . $this->eventId),
        ];
    }

    public function broadcastAs(): string
    {
        // Event name for frontend listeners - prefix with dot for client events
        return '.VotingStateChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'event_id' => $this->eventId,
            'action' => $this->action,
            'voting_state' => $this->votingState,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
