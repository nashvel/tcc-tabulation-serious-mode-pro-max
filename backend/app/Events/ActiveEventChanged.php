<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActiveEventChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $eventId;
    public $eventTitle;

    public function __construct($eventId, $eventTitle = null)
    {
        $this->eventId = $eventId;
        $this->eventTitle = $eventTitle;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('global'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ActiveEventChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'event_id' => $this->eventId,
            'event_title' => $this->eventTitle,
            'action' => 'event_switched',
        ];
    }
}
