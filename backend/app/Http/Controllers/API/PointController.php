<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Point;
use App\Events\ScoreUpdated;
use App\Events\JudgeTyping;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;

class PointController extends Controller
{
    public function index(): JsonResponse
    {
        $points = Point::with(['candidate', 'round', 'criteria', 'judge'])->get();
        Log::info('Fetching all points', ['count' => $points->count()]);
        if ($points->count() > 0) {
            Log::info('Sample point:', $points->first()->toArray());
        }
        return response()->json($points);
    }

    public function store(Request $request): JsonResponse
    {
        Log::info('=== SCORE SUBMISSION START ===');
        Log::info('Raw request data', $request->all());
        
        try {
            $validated = $request->validate([
                'candidate_id' => 'required|exists:candidates,id',
                'round_id' => 'required|exists:rounds,id',
                'criteria_id' => 'required|exists:criteria,id',
                'points' => 'required|numeric',
                'judge_id' => 'required|integer',
                'event_id' => 'required|exists:events,id',
            ]);
            
            Log::info('Validation passed', $validated);
            
            // Store event_id for broadcasting later
            $eventId = $validated['event_id'];
            
            // Validate judge belongs to the event
            $judge = \App\Models\Judge::where('id', $validated['judge_id'])
                ->where('event_id', $eventId)
                ->first();
            
            if (!$judge) {
                Log::error('Judge not found for event', [
                    'judge_id' => $validated['judge_id'],
                    'event_id' => $eventId,
                ]);
                return response()->json([
                    'error' => 'Judge not found for this event'
                ], 422);
            }
            
            // Remove event_id from validated data since points table doesn't have it
            unset($validated['event_id']);

            // Check if point already exists for this combination
            $existing = Point::where('candidate_id', $validated['candidate_id'])
                ->where('round_id', $validated['round_id'])
                ->where('criteria_id', $validated['criteria_id'])
                ->where('judge_id', $validated['judge_id'])
                ->first();

            if ($existing) {
                Log::info('Found existing score record', [
                    'point_id' => $existing->id,
                    'old_points' => $existing->points,
                    'new_points' => $validated['points'],
                ]);
                $existing->update(['points' => $validated['points']]);
                Log::info('Score updated successfully', [
                    'point_id' => $existing->id,
                    'updated_points' => $existing->points,
                ]);
                
                // Broadcast score update event
                Log::info('Broadcasting ScoreUpdated event', [
                    'channel' => 'scores.' . $eventId,
                    'event' => 'ScoreUpdated',
                    'judge_id' => $existing->judge_id,
                    'candidate_id' => $existing->candidate_id,
                    'criteria_id' => $existing->criteria_id,
                    'points' => $existing->points,
                    'BROADCAST_CONNECTION' => config('broadcasting.default'),
                    'PUSHER_APP_ID' => config('broadcasting.connections.pusher.app_id'),
                    'PUSHER_KEY' => substr(config('broadcasting.connections.pusher.key') ?? '', 0, 5),
                    'QUEUE_CONNECTION' => config('queue.default'),
                ]);
                
                Log::info('About to broadcast ScoreUpdated event');
                try {
                    // Dispatch event immediately (synchronously)
                    Event::dispatch(new ScoreUpdated(
                        $existing->judge_id,
                        $existing->candidate_id,
                        $existing->criteria_id,
                        $existing->points,
                        $eventId
                    ));
                    
                    Log::info('Event dispatched via Event::dispatch()');
                } catch (\Exception $e) {
                    Log::error('Broadcast error:', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
                
                Log::info('✓ Score update broadcasted via WebSocket');
                
                return response()->json($existing);
            }

            Log::info('Creating new score record', $validated);
            
            $point = Point::create($validated);
            Log::info('✓ Score saved successfully to database', [
                'point_id' => $point->id,
                'candidate_id' => $point->candidate_id,
                'round_id' => $point->round_id,
                'criteria_id' => $point->criteria_id,
                'judge_id' => $point->judge_id,
                'points' => $point->points,
            ]);
            
            // Broadcast score update event
            Log::info('Broadcasting ScoreUpdated event (new)', [
                'channel' => 'scores.' . $eventId,
                'event' => 'ScoreUpdated',
                'judge_id' => $point->judge_id,
                'candidate_id' => $point->candidate_id,
                'criteria_id' => $point->criteria_id,
                'points' => $point->points,
                'BROADCAST_CONNECTION' => config('broadcasting.default'),
                'PUSHER_APP_ID' => config('broadcasting.connections.pusher.app_id'),
                'PUSHER_KEY' => substr(config('broadcasting.connections.pusher.key') ?? '', 0, 5),
                'QUEUE_CONNECTION' => config('queue.default'),
            ]);
            
            Log::info('About to broadcast ScoreUpdated event');
            try {
                // Dispatch event immediately (synchronously)
                Event::dispatch(new ScoreUpdated(
                    $point->judge_id,
                    $point->candidate_id,
                    $point->criteria_id,
                    $point->points,
                    $eventId
                ));
                
                Log::info('Event dispatched via Event::dispatch()');
            } catch (\Exception $e) {
                Log::error('Broadcast error:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
            
            Log::info('✓ Score creation broadcasted via WebSocket');
            
            return response()->json($point, 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error saving score', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        }
    }

    public function show(string $id): JsonResponse
    {
        $point = Point::with(['candidate', 'round', 'criteria'])->findOrFail($id);
        return response()->json($point);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $point = Point::findOrFail($id);
        
        $validated = $request->validate([
            'candidate_id' => 'sometimes|exists:candidates,id',
            'round_id' => 'sometimes|exists:rounds,id',
            'criteria_id' => 'sometimes|exists:criteria,id',
            'points' => 'sometimes|integer',
            'judge_id' => 'sometimes|exists:judges,id',
        ]);

        $point->update($validated);
        return response()->json($point);
    }

    public function destroy(string $id): JsonResponse
    {
        $point = Point::findOrFail($id);
        $point->delete();
        return response()->json(null, 204);
    }

    /**
     * Broadcast judge typing status (no storage).
     */
    public function typing(Request $request): JsonResponse
    {
        Log::info('🔔 === TYPING NOTIFICATION RECEIVED ===');
        Log::info('Raw typing request data', $request->all());
        
        $validated = $request->validate([
            'judge_id' => 'required|integer',
            'candidate_id' => 'required|exists:candidates,id',
            'criteria_id' => 'required|exists:criteria,id',
            'is_typing' => 'required|boolean',
            'event_id' => 'required|exists:events,id',
        ]);

        Log::info('Typing validation passed', $validated);

        // Broadcast typing event (no database storage)
        Event::dispatch(new JudgeTyping(
            $validated['judge_id'],
            $validated['candidate_id'],
            $validated['criteria_id'],
            $validated['is_typing'],
            $validated['event_id']
        ));

        Log::info('✅ JudgeTyping event dispatched');

        return response()->json(['success' => true]);
    }


    public function getScoreboard(Request $request): JsonResponse
    {
        $roundId = $request->query('round_id');

        $query = Point::with(['candidate', 'criteria', 'judge'])
            ->selectRaw('candidate_id, SUM(points) as total_points')
            ->groupBy('candidate_id');

        if ($roundId) {
            $query->where('round_id', $roundId);
        }

        $scores = $query->orderBy('total_points', 'desc')->get();
        return response()->json($scores);
    }
}
