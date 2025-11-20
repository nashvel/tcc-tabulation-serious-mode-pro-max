<?php

namespace App\Http\Controllers;

use App\Events\VotingStateChanged;
use App\Models\VotingSession;
use App\Models\VotingState;
use App\Models\Round;
use App\Models\Criteria;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VotingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/voting/state",
     *     tags={"Voting"},
     *     summary="Get current voting state",
     *     description="Returns the current voting state including active session, active round, and lock status",
     *     @OA\Parameter(
     *         name="event_id",
     *         in="query",
     *         description="Event ID",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="is_locked", type="boolean", example=false),
     *             @OA\Property(property="active_session", type="object"),
     *             @OA\Property(property="active_round", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="spot", type="integer")
     *             )
     *         )
     *     )
     * )
     */
    public function getState(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1); // Default to event 1 or get from session
            
            $votingState = VotingState::with(['activeSession', 'activeRound'])
                ->where('event_id', $eventId)
                ->first();

            if (!$votingState) {
                // Create initial voting state
                $votingState = VotingState::create([
                    'event_id' => $eventId,
                    'is_active' => false,
                ]);
            }

            $response = [
                'is_active' => $votingState->is_active,
                'is_locked' => $votingState->is_locked ?? false,
                'active_session' => $votingState->activeSession,
                'active_round' => null,
            ];

            if ($votingState->active_round_id) {
                $round = Round::with('criteria')->find($votingState->active_round_id);
                $response['active_round'] = [
                    'id' => $round->id,
                    'name' => $round->name,
                    'spot' => $round->spot,
                    'criteria' => $round->criteria,
                ];
            }

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error getting voting state: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get voting state'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/voting/start",
     *     tags={"Voting"},
     *     summary="Start voting session",
     *     description="Starts a new voting session and marks event as active. If event is completed, it will be reactivated.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID to start"),
     *             @OA\Property(property="day_number", type="integer", example=1, description="Day number"),
     *             @OA\Property(property="day_name", type="string", example="Day 1", description="Day name")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Voting started successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Voting started successfully"),
     *             @OA\Property(property="session", type="object"),
     *             @OA\Property(property="voting_state", type="object")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Voting is already active or event is archived")
     * )
     */
    public function start(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            $dayNumber = $request->input('day_number', 1);
            $dayName = $request->input('day_name', 'Day ' . $dayNumber);

            DB::beginTransaction();

            // Get or create voting state
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                ['is_active' => false]
            );

            if ($votingState->is_active) {
                return response()->json(['error' => 'Voting is already active'], 400);
            }

            // Check if event is archived (truly locked)
            $event = Event::find($eventId);
            if ($event && $event->status === 'archived') {
                return response()->json(['error' => 'Cannot restart archived event'], 400);
            }

            // If event is completed, set it back to active for restart
            if ($event && $event->status === 'completed') {
                $event->update(['status' => 'active']);
                Log::info("Event {$eventId} restarted from completed state");
            }

            // Create new voting session
            $session = VotingSession::create([
                'event_id' => $eventId,
                'day_number' => $dayNumber,
                'day_name' => $dayName,
                'started_at' => now(),
                'status' => 'active',
            ]);

            // Update voting state
            $votingState->update([
                'is_active' => true,
                'active_session_id' => $session->id,
            ]);

            DB::commit();

            // Broadcast the change
            broadcast(new VotingStateChanged($eventId, [
                'is_active' => true,
                'active_session' => $session,
            ], 'started'));

            return response()->json([
                'message' => 'Voting started successfully',
                'session' => $session,
                'voting_state' => $votingState,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error starting voting: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to start voting: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/voting/stop",
     *     tags={"Voting"},
     *     summary="Stop voting session and mark event as completed",
     *     description="Stops the active voting session, marks event as completed, and documents the session",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID to stop")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event stopped and documented successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event completed and documented successfully"),
     *             @OA\Property(property="voting_state", type="object"),
     *             @OA\Property(property="event_status", type="string", example="completed")
     *         )
     *     ),
     *     @OA\Response(response=400, description="No active voting session")
     * )
     */
    public function stop(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);

            DB::beginTransaction();

            $event = Event::find($eventId);
            if (!$event) {
                return response()->json(['error' => 'Event not found'], 404);
            }

            // Mark the event as completed - NO DATA CLEARING
            // Data is preserved for real-time WebSocket updates and manual review
            $event->update([
                'status' => 'completed'
            ]);

            // Get voting state for broadcast
            $votingState = VotingState::where('event_id', $eventId)->first();

            DB::commit();

            Log::info("Event {$eventId} marked as completed (data preserved for WebSocket)");

            // Broadcast the change
            broadcast(new VotingStateChanged($eventId, [
                'event_status' => 'completed',
                'message' => 'Event marked as completed - data preserved',
            ], 'event_completed'));

            return response()->json([
                'message' => 'Event marked as completed successfully',
                'event_status' => 'completed',
                'data_preserved' => true,
                'voting_state' => $votingState,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error stopping event: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to stop event: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/voting/activate-round",
     *     tags={"Voting"},
     *     summary="Activate a specific round for judging",
     *     description="Sets the active round for judges to score. Must have an active voting session.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id", "round_id"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID"),
     *             @OA\Property(property="round_id", type="integer", example=1, description="Round ID to activate")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Round activated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Round activated successfully"),
     *             @OA\Property(property="voting_state", type="object"),
     *             @OA\Property(property="round", type="object")
     *         )
     *     ),
     *     @OA\Response(response=400, description="No active voting session")
     * )
     */
    public function activateRound(Request $request)
    {
        $request->validate([
            'round_id' => 'required|exists:rounds,id',
        ]);

        try {
            $eventId = $request->input('event_id', 1);
            $roundId = $request->input('round_id');

            DB::beginTransaction();

            // Get or create voting state - no prerequisites
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                [
                    'is_active' => false,
                    'active_round_id' => null,
                ]
            );

            $round = Round::with('criteria')->findOrFail($roundId);

            // Update voting state with active round - completely free switching
            $votingState->update([
                'active_round_id' => $round->id,
                'active_round_name' => $round->name,
            ]);

            // Create session if it doesn't exist (auto-start if needed)
            if (!$votingState->active_session_id) {
                $session = VotingSession::create([
                    'event_id' => $eventId,
                    'round_id' => $round->id,
                    'round_name' => $round->name,
                    'status' => 'active',
                    'started_at' => now(),
                ]);
                $votingState->update(['active_session_id' => $session->id]);
            } else {
                // Update existing session with new round
                VotingSession::where('id', $votingState->active_session_id)->update([
                    'round_id' => $round->id,
                    'round_name' => $round->name,
                ]);
            }

            DB::commit();

            // Broadcast the change
            broadcast(new VotingStateChanged($eventId, [
                'is_active' => $votingState->is_active,
                'active_session' => $votingState->activeSession,
                'active_round' => [
                    'id' => $round->id,
                    'name' => $round->name,
                    'spot' => $round->spot,
                    'criteria' => $round->criteria,
                ],
            ], 'round_changed'));

            Log::info("Round {$roundId} activated for event {$eventId} (no prerequisites)");

            return response()->json([
                'message' => 'Round activated successfully',
                'round' => $round,
                'voting_state' => $votingState,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error activating round: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to activate round: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/voting/lock",
     *     tags={"Voting"},
     *     summary="Lock all judge screens",
     *     description="Locks all judge screens preventing them from viewing or submitting scores",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Screens locked successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Screens locked successfully")
     *         )
     *     )
     * )
     */
    public function lock(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                return response()->json(['error' => 'Voting state not found'], 404);
            }
            
            $votingState->update(['is_locked' => true]);
            
            // Broadcast the lock event
            broadcast(new VotingStateChanged($eventId, [
                'is_active' => $votingState->is_active,
                'is_locked' => true,
            ], 'locked'));
            
            return response()->json([
                'message' => 'Screen locked successfully',
                'voting_state' => $votingState,
            ]);
        } catch (\Exception $e) {
            Log::error('Error locking screen: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to lock screen'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/voting/unlock",
     *     tags={"Voting"},
     *     summary="Unlock all judge screens",
     *     description="Unlocks all judge screens allowing them to view and submit scores",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Screens unlocked successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Screen unlocked successfully")
     *         )
     *     )
     * )
     */
    public function unlock(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                return response()->json(['error' => 'Voting state not found'], 404);
            }
            
            $votingState->update(['is_locked' => false]);
            
            // Broadcast the unlock event
            broadcast(new VotingStateChanged($eventId, [
                'is_active' => $votingState->is_active,
                'is_locked' => false,
            ], 'unlocked'));
            
            return response()->json([
                'message' => 'Screen unlocked successfully',
                'voting_state' => $votingState,
            ]);
        } catch (\Exception $e) {
            Log::error('Error unlocking screen: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to unlock screen'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/voting/history",
     *     tags={"Voting"},
     *     summary="Get voting session history",
     *     description="Returns all past voting sessions for an event",
     *     @OA\Parameter(
     *         name="event_id",
     *         in="query",
     *         description="Event ID",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="sessions", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function getHistory(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            
            $sessions = VotingSession::where('event_id', $eventId)
                ->with('round')
                ->orderBy('day_number', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->groupBy('day_number');

            return response()->json([
                'sessions' => $sessions,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting voting history: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get voting history'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/occupied-judges",
     *     tags={"Judge Management"},
     *     summary="Get list of occupied judge slots",
     *     description="Returns array of judge IDs that are currently occupied",
     *     @OA\Parameter(
     *         name="event_id",
     *         in="query",
     *         description="Event ID",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="occupied", type="array", @OA\Items(type="integer"), example={1, 3, 5})
     *         )
     *     )
     * )
     */
    public function getOccupiedJudges(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                return response()->json(['occupied' => []]);
            }
            
            $occupied = $votingState->occupied_judges ?? [];
            
            return response()->json(['occupied' => $occupied]);
        } catch (\Exception $e) {
            Log::error('Error getting occupied judges: ' . $e->getMessage());
            return response()->json(['occupied' => []], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/occupy-judge",
     *     tags={"Judge Management"},
     *     summary="Occupy a judge slot",
     *     description="Marks a judge ID as occupied to prevent duplicate logins",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"judge_id"},
     *             @OA\Property(property="judge_id", type="integer", example=1, description="Judge ID to occupy"),
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Judge slot occupied successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Judge occupied successfully")
     *         )
     *     ),
     *     @OA\Response(response=409, description="Judge already occupied")
     * )
     */
    public function occupyJudge(Request $request)
    {
        try {
            $judgeId = $request->input('judge_id');
            $eventId = $request->input('event_id', 1);
            
            Log::info("Attempting to occupy judge", [
                'judge_id' => $judgeId,
                'event_id' => $eventId
            ]);
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                Log::info("Creating new voting state for event {$eventId}");
                $votingState = VotingState::create([
                    'event_id' => $eventId,
                    'is_active' => false,
                    'occupied_judges' => [],
                ]);
            }
            
            $occupied = $votingState->occupied_judges ?? [];
            
            Log::info("Current occupied judges", ['occupied' => $occupied]);
            
            // Check if judge is already occupied
            if (in_array($judgeId, $occupied)) {
                Log::warning("Judge {$judgeId} already occupied");
                return response()->json([
                    'success' => false,
                    'message' => 'Judge already occupied'
                ], 409);
            }
            
            // Add judge to occupied list
            $occupied[] = $judgeId;
            $votingState->occupied_judges = $occupied;
            $votingState->save();
            
            Log::info("Judge {$judgeId} successfully occupied", ['all_occupied' => $occupied]);
            
            return response()->json([
                'success' => true,
                'occupied' => $occupied
            ]);
        } catch (\Exception $e) {
            Log::error('Error occupying judge: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false, 
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/clear-occupied-judges",
     *     tags={"Judge Management"},
     *     summary="Clear all occupied judge slots",
     *     description="Clears all occupied judge slots (admin function)",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Occupied judges cleared successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="All judges cleared")
     *         )
     *     )
     * )
     */
    public function clearOccupiedJudges(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if ($votingState) {
                $votingState->occupied_judges = [];
                $votingState->save();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'All judges cleared'
            ]);
        } catch (\Exception $e) {
            Log::error('Error clearing occupied judges: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/clear-event-scores",
     *     tags={"Event Management"},
     *     summary="Clear all scores and event sequence",
     *     description="Clears all scores and event sequence for an event (keeps candidates and judges)",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Scores and sequence cleared successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="All scores and event sequence cleared")
     *         )
     *     )
     * )
     */
    public function clearEventScores(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);
            
            Log::info("Clearing scores and sequence for event {$eventId}");
            
            // Clear all voting points for this event
            DB::table('voting_points')
                ->whereHas('votingSession', function ($query) use ($eventId) {
                    $query->where('event_id', $eventId);
                })
                ->delete();
            
            // Clear all voting sessions for this event
            VotingSession::where('event_id', $eventId)->delete();
            
            // Clear event sequence
            DB::table('event_sequences')
                ->where('event_id', $eventId)
                ->delete();
            
            // Reset voting state
            $votingState = VotingState::where('event_id', $eventId)->first();
            if ($votingState) {
                $votingState->is_active = false;
                $votingState->active_round_id = null;
                $votingState->active_round_name = null;
                $votingState->active_session_id = null;
                $votingState->save();
            }
            
            Log::info("Successfully cleared scores and sequence for event {$eventId}");
            
            return response()->json([
                'success' => true,
                'message' => 'All scores and event sequence cleared'
            ]);
        } catch (\Exception $e) {
            Log::error('Error clearing event scores: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false, 
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}
