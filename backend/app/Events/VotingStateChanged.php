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
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('voting.' . $this->eventId),
        ];
    }

    public function broadcastAs(): string
    {
        // Laravel Echo expects dot-prefixed event names
        return 'voting.state.changed';
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
