<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Point;
use App\Models\ActivityLog;
use App\Models\Candidate;
use App\Models\Criteria;
use App\Events\ScoreUpdated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;

class PointController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Point::with(['candidate', 'round', 'criteria', 'judge']);

        // Filter by event_id if provided
        if ($request->has('event_id')) {
            // Since points table doesn't have event_id, we filter via related models
            // Assuming candidates, rounds, or criteria belong to an event
            // Let's filter by candidate's event_id
            $eventId = $request->input('event_id');
            $query->whereHas('candidate', function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            });
        }

        // Filter by judge_id if provided
        if ($request->has('judge_id')) {
            $query->where('judge_id', $request->input('judge_id'));
        }

        $points = $query->get();

        return response()->json($points);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            // Minimal validation for speed
            $validated = $request->validate([
                'candidate_id' => 'required|integer',
                'round_id' => 'required|integer',
                'criteria_id' => 'required|integer',
                'points' => 'required|numeric',
                'judge_id' => 'required|integer',
                'event_id' => 'required|integer',
            ]);
            
            unset($validated['event_id']);

            // Use updateOrCreate for speed
            $point = Point::updateOrCreate(
                [
                    'candidate_id' => $validated['candidate_id'],
                    'round_id' => $validated['round_id'],
                    'criteria_id' => $validated['criteria_id'],
                    'judge_id' => $validated['judge_id'],
                ],
                ['points' => $validated['points']]
            );
            
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

    /**
     * Store multiple scores at once (batch submission)
     * Ultra-optimized for 10+ concurrent judges on LAN
     */
    public function storeBatch(Request $request): JsonResponse
    {
        $judgeId = $request->input('judge_id');
        $eventId = $request->input('event_id');
        $scores = $request->input('scores', []);
        
        // Quick validation - skip heavy Laravel validation for speed
        if (empty($scores) || !$judgeId || !$eventId) {
            return response()->json(['error' => 'Missing required fields'], 400);
        }
        
        $now = now();
        
        // Prepare data for bulk upsert - minimal processing
        $upsertData = [];
        foreach ($scores as $score) {
            $upsertData[] = [
                'candidate_id' => (int)$score['candidate_id'],
                'round_id' => (int)$score['round_id'],
                'criteria_id' => (int)$score['criteria_id'],
                'judge_id' => (int)$judgeId,
                'points' => (float)$score['points'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        // Single bulk upsert - handles concurrent writes safely
        Point::upsert(
            $upsertData,
            ['candidate_id', 'round_id', 'criteria_id', 'judge_id'],
            ['points', 'updated_at']
        );
        
        // Log activity (async-friendly, minimal overhead)
        try {
            foreach ($scores as $score) {
                $candidate = Candidate::find($score['candidate_id']);
                $criteria = Criteria::find($score['criteria_id']);
                
                ActivityLog::log($eventId, ActivityLog::ACTION_SCORE_ENTERED, [
                    'candidate_id' => $score['candidate_id'],
                    'candidate_name' => $candidate?->name ?? 'Unknown',
                    'criteria_id' => $score['criteria_id'],
                    'criteria_name' => $criteria?->name ?? 'Unknown',
                    'round_id' => $score['round_id'],
                    'points' => $score['points'],
                ], $judgeId, $request);
            }
        } catch (\Exception $e) {
            Log::warning('Activity log failed', ['error' => $e->getMessage()]);
        }
        
        // Fire-and-forget broadcast (don't wait for WebSocket response)
        try {
            broadcast(new ScoreUpdated(
                (int)$judgeId,
                null,
                null,
                null,
                (int)$eventId,
                $scores
            ))->toOthers(); // Don't send back to the judge who submitted
        } catch (\Exception $e) {
            // Log but don't fail the request if broadcast fails
            Log::warning('Broadcast failed', ['error' => $e->getMessage()]);
        }
        
        // Minimal response for speed
        return response()->json([
            'success' => true,
            'saved' => count($upsertData)
        ]);
    }
}
