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
    public $action; // 'started', 'stopped', 'round_changed'

    public function __construct($eventId, $votingState, $action = 'updated')
    {
        $this->eventId = $eventId;
        $this->votingState = $votingState;
        $this->action = $action;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('voting.' . $this->eventId),
        ];
    }

    public function broadcastAs(): string
    {
        // For Socket.IO via Echo Server, use the channel name as the event
        return 'voting.' . $this->eventId;
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
