<?php

namespace App\Http\Controllers;

use App\Models\EventSequence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EventSequenceController extends Controller
{
    /**
     * Get event sequence for an event
     */
    public function index(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            
            $sequences = EventSequence::where('event_id', $eventId)
                ->with('round')
                ->orderBy('order')
                ->get();
            
            return response()->json($sequences);
        } catch (\Exception $e) {
            Log::error('Error fetching event sequence: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch sequence'], 500);
        }
    }

    /**
     * Add round to sequence
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'round_id' => 'required|exists:rounds,id',
        ]);

        try {
            // Check if already exists
            $existing = EventSequence::where('event_id', $request->event_id)
                ->where('round_id', $request->round_id)
                ->first();
            
            if ($existing) {
                return response()->json(['error' => 'Round already in sequence'], 400);
            }
            
            // Get max order
            $maxOrder = EventSequence::where('event_id', $request->event_id)
                ->max('order') ?? -1;
            
            $sequence = EventSequence::create([
                'event_id' => $request->event_id,
                'round_id' => $request->round_id,
                'order' => $maxOrder + 1,
            ]);
            
            $sequence->load('round');
            
            return response()->json([
                'message' => 'Round added to sequence',
                'sequence' => $sequence,
            ]);
        } catch (\Exception $e) {
            Log::error('Error adding to sequence: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add to sequence'], 500);
        }
    }

    /**
     * Remove round from sequence
     */
    public function destroy(Request $request, $id)
    {
        try {
            $sequence = EventSequence::findOrFail($id);
            $eventId = $sequence->event_id;
            $deletedOrder = $sequence->order;
            
            $sequence->delete();
            
            // Reorder remaining items
            EventSequence::where('event_id', $eventId)
                ->where('order', '>', $deletedOrder)
                ->decrement('order');
            
            return response()->json(['message' => 'Removed from sequence']);
        } catch (\Exception $e) {
            Log::error('Error removing from sequence: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to remove from sequence'], 500);
        }
    }

    /**
     * Reorder sequence
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'sequence' => 'required|array',
            'sequence.*.id' => 'required|exists:event_sequences,id',
            'sequence.*.order' => 'required|integer',
        ]);

        try {
            DB::beginTransaction();
            
            foreach ($request->sequence as $item) {
                EventSequence::where('id', $item['id'])
                    ->update(['order' => $item['order']]);
            }
            
            DB::commit();
            
            return response()->json(['message' => 'Sequence reordered successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error reordering sequence: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reorder sequence'], 500);
        }
    }

    /**
     * Move item up
     */
    public function moveUp(Request $request, $id)
    {
        try {
            $sequence = EventSequence::findOrFail($id);
            
            if ($sequence->order === 0) {
                return response()->json(['error' => 'Already at top'], 400);
            }
            
            DB::beginTransaction();
            
            // Swap with previous item
            $previous = EventSequence::where('event_id', $sequence->event_id)
                ->where('order', $sequence->order - 1)
                ->first();
            
            if ($previous) {
                $previous->update(['order' => $sequence->order]);
                $sequence->update(['order' => $sequence->order - 1]);
            }
            
            DB::commit();
            
            return response()->json(['message' => 'Moved up']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error moving up: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to move up'], 500);
        }
    }

    /**
     * Move item down
     */
    public function moveDown(Request $request, $id)
    {
        try {
            $sequence = EventSequence::findOrFail($id);
            
            $maxOrder = EventSequence::where('event_id', $sequence->event_id)
                ->max('order');
            
            if ($sequence->order === $maxOrder) {
                return response()->json(['error' => 'Already at bottom'], 400);
            }
            
            DB::beginTransaction();
            
            // Swap with next item
            $next = EventSequence::where('event_id', $sequence->event_id)
                ->where('order', $sequence->order + 1)
                ->first();
            
            if ($next) {
                $next->update(['order' => $sequence->order]);
                $sequence->update(['order' => $sequence->order + 1]);
            }
            
            DB::commit();
            
            return response()->json(['message' => 'Moved down']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error moving down: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to move down'], 500);
        }
    }
}
