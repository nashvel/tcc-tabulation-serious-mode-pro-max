<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActivityLogCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $log;
    public $event_id;

    public function __construct($log, $event_id)
    {
        $this->log = $log;
        $this->event_id = $event_id;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('activity.' . $this->event_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'log' => $this->log,
            'event_id' => $this->event_id,
        ];
    }

    public function broadcastAs(): string
    {
        return 'ActivityLogCreated';
    }
}
