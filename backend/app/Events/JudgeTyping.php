<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class JudgeTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $judge_id;
    public $candidate_id;
    public $criteria_id;
    public $is_typing;
    public $event_id;

    /**
     * Create a new event instance.
     */
    public function __construct($judge_id, $candidate_id, $criteria_id, $is_typing, $event_id)
    {
        $this->judge_id = $judge_id;
        $this->candidate_id = $candidate_id;
        $this->criteria_id = $criteria_id;
        $this->is_typing = $is_typing;
        $this->event_id = $event_id;

        // Log broadcast details
        Log::info('Broadcasting JudgeTyping event', [
            'channel' => 'scores.' . $event_id,
            'event' => '.JudgeTyping',
            'judge_id' => $judge_id,
            'candidate_id' => $candidate_id,
            'criteria_id' => $criteria_id,
            'is_typing' => $is_typing,
            'BROADCAST_CONNECTION' => config('broadcasting.default'),
            'PUSHER_APP_ID' => config('broadcasting.connections.pusher.app_id'),
            'PUSHER_KEY' => config('broadcasting.connections.pusher.key'),
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [new Channel('scores.' . $this->event_id)];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'JudgeTyping';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'judge_id' => $this->judge_id,
            'candidate_id' => $this->candidate_id,
            'criteria_id' => $this->criteria_id,
            'is_typing' => $this->is_typing,
            'event_id' => $this->event_id,
        ];
    }
}
