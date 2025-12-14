<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event broadcast when judge screen registrations change
 * Triggered when screens register, unregister, or are cleared
 */
class ScreenRegistrationChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $eventId;
    public $registeredScreens;
    public $action; // 'registered', 'unregistered', 'cleared', 'reassigned'
    public $affectedScreen; // Details of the screen that was affected (optional)

    /**
     * Create a new event instance.
     *
     * @param int $eventId The event ID
     * @param array $registeredScreens Updated list of all registered screens
     * @param string $action The action that triggered this event
     * @param array|null $affectedScreen Details of the affected screen (optional)
     */
    public function __construct($eventId, array $registeredScreens, string $action = 'updated', ?array $affectedScreen = null)
    {
        $this->eventId = $eventId;
        $this->registeredScreens = $registeredScreens;
        $this->action = $action;
        $this->affectedScreen = $affectedScreen;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('voting.' . $this->eventId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ScreenRegistrationChanged';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'event_id' => $this->eventId,
            'action' => $this->action,
            'registered_screens' => $this->registeredScreens,
            'affected_screen' => $this->affectedScreen,
            'total_registered' => count($this->registeredScreens),
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
