<?php

namespace App\Http\Controllers;

use App\Events\ScreenRegistrationChanged;
use App\Events\VotingStateChanged;
use App\Models\VotingSession;
use App\Models\VotingState;
use App\Models\Round;
use App\Models\Criteria;
use App\Models\Event;
use App\Models\ActivityLog;
use App\Models\Judge;
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
            $eventIdInput = $request->input('event_id');
            
            // If no event_id provided, return error
            if (!$eventIdInput) {
                return response()->json([
                    'event_id' => null,
                    'is_locked' => false,
                    'active_session' => null,
                    'active_round' => null,
                    'active_round_id' => null,
                    'error' => 'No event_id provided'
                ], 400);
            }
            
            // Try to parse as integer first
            $eventId = (int) $eventIdInput;
            
            // If it's 0 (meaning it wasn't a valid integer), try to find by unique_id
            if ($eventId <= 0) {
                $event = Event::where('unique_id', $eventIdInput)->first();
                if (!$event) {
                    return response()->json([
                        'event_id' => null,
                        'error' => 'Event not found'
                    ], 404);
                }
                $eventId = $event->id;
            } else {
                // Verify event exists
                $event = Event::find($eventId);
                if (!$event) {
                    return response()->json([
                        'event_id' => null,
                        'error' => 'Event not found'
                    ], 404);
                }
            }
            
            $votingState = VotingState::with(['activeSession', 'activeRound'])
                ->where('event_id', $eventId)
                ->first();

            if (!$votingState) {
                // Create initial voting state
                $votingState = VotingState::create([
                    'event_id' => $eventId,
                ]);
            }

            $response = [
                'event_id' => $votingState->event_id,
                'is_locked' => $votingState->is_locked ?? false,
                'show_judge_numbers' => $votingState->show_judge_numbers ?? false,
                'active_session' => $votingState->activeSession,
                'active_round' => null,
                'active_round_id' => $votingState->active_round_id,
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
            
            // Convert to integer if it's a string
            $eventId = (int) $eventId;

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

            // Convert to integer if it's a string
            $eventId = (int) $eventId;
            $roundId = (int) $roundId;

            // Log the incoming request
            Log::info("activateRound called with:", [
                'event_id' => $eventId,
                'round_id' => $roundId,
                'round_id_type' => gettype($roundId),
            ]);

            DB::beginTransaction();

            // Clear active_round_id from ALL other events first
            // This ensures only one event can be active for judging at a time
            VotingState::where('event_id', '!=', $eventId)
                ->whereNotNull('active_round_id')
                ->update(['active_round_id' => null]);

            // Get or create voting state - no prerequisites
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                [
                    'active_round_id' => null,
                ]
            );

            $round = Round::with('criteria')->findOrFail($roundId);
            
            Log::info("Round found:", [
                'id' => $round->id,
                'name' => $round->name,
            ]);

            // Update voting state with active round - completely free switching
            $votingState->update([
                'active_round_id' => $round->id,
            ]);

            // Create session if it doesn't exist (auto-start if needed)
            if (!$votingState->active_session_id) {
                $session = VotingSession::create([
                    'event_id' => $eventId,
                    'day_number' => 1,
                    'day_name' => 'Day 1',
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

            // Broadcast the round change to all connected judges
            $activeSession = $votingState->activeSession;
            $broadcastData = [
                'is_active' => $votingState->is_active,
                'active_session' => $activeSession ? $activeSession->toArray() : null,
                'active_round' => [
                    'id' => $round->id,
                    'name' => $round->name,
                    'spot' => $round->spot,
                    'criteria' => $round->criteria ? $round->criteria->toArray() : [],
                ],
            ];
            
            broadcast(new VotingStateChanged($eventId, $broadcastData, 'round_activated'));
            Log::info("Round {$roundId} activated for event {$eventId}, broadcast sent");

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
            $eventIdInput = $request->input('event_id');
            
            if (!$eventIdInput) {
                return response()->json(['error' => 'No event_id provided'], 400);
            }
            
            // Convert to integer or lookup by unique_id
            $eventId = (int) $eventIdInput;
            if ($eventId <= 0) {
                $event = Event::where('unique_id', $eventIdInput)->first();
                if (!$event) {
                    return response()->json(['error' => 'Event not found'], 404);
                }
                $eventId = $event->id;
            }
            
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                ['is_locked' => false]
            );
            
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
            $eventIdInput = $request->input('event_id');
            
            if (!$eventIdInput) {
                return response()->json(['error' => 'No event_id provided'], 400);
            }
            
            // Convert to integer or lookup by unique_id
            $eventId = (int) $eventIdInput;
            if ($eventId <= 0) {
                $event = Event::where('unique_id', $eventIdInput)->first();
                if (!$event) {
                    return response()->json(['error' => 'Event not found'], 404);
                }
                $eventId = $event->id;
            }
            
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                ['is_locked' => true]
            );
            
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
     * @OA\Post(
     *     path="/api/voting/start-first-round",
     *     tags={"Voting"},
     *     summary="Auto-activate the first round",
     *     description="Automatically activates the first round from event sequence",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="First round activated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="round", type="object")
     *         )
     *     )
     * )
     */
    public function startFirstRound(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);

            // Get the first round from event sequence
            $firstSequence = DB::table('event_sequences')
                ->where('event_id', $eventId)
                ->orderBy('order', 'asc')
                ->first();

            if (!$firstSequence) {
                return response()->json(['error' => 'No event sequence found'], 404);
            }

            // Activate the first round
            $round = Round::find($firstSequence->round_id);
            if (!$round) {
                return response()->json(['error' => 'Round not found'], 404);
            }

            // Use activateRound to set it up properly
            return $this->activateRound(new Request([
                'event_id' => $eventId,
                'round_id' => $round->id
            ]));

        } catch (\Exception $e) {
            Log::error('Error starting first round: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to start first round: ' . $e->getMessage()], 500);
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
            
            // Convert to integer if it's a string
            $eventId = (int) $eventId;
            
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
            
            // Log activity
            try {
                $judge = Judge::find($judgeId);
                ActivityLog::log($eventId, ActivityLog::ACTION_JUDGE_LOGIN, [
                    'judge_name' => $judge?->name ?? 'Judge #' . $judgeId,
                    'chair_number' => $judge?->chair_number,
                ], $judgeId, $request);
            } catch (\Exception $e) {
                Log::warning('Activity log failed: ' . $e->getMessage());
            }
            
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

    /**
     * Update display settings for judge screens
     */
    public function updateDisplaySettings(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'No event_id provided'], 400);
            }
            
            $eventId = (int) $eventId;
            
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                ['display_settings' => VotingState::getDefaultDisplaySettings()]
            );
            
            $currentSettings = $votingState->display_settings ?? VotingState::getDefaultDisplaySettings();
            
            if ($request->has('show_candidate_name')) {
                $currentSettings['show_candidate_name'] = (bool) $request->input('show_candidate_name');
            }
            if ($request->has('show_team_department')) {
                $currentSettings['show_team_department'] = (bool) $request->input('show_team_department');
            }
            if ($request->has('judge_login_mode')) {
                $mode = $request->input('judge_login_mode');
                // Validate mode is either 'auto' or 'manual'
                $currentSettings['judge_login_mode'] = in_array($mode, ['auto', 'manual']) ? $mode : 'auto';
            }
            
            $votingState->display_settings = $currentSettings;
            $votingState->save();
            
            // Broadcast the settings change to all judges
            broadcast(new VotingStateChanged($eventId, [
                'display_settings' => $currentSettings,
            ], 'display_settings_changed'));
            
            Log::info("Display settings updated for event {$eventId}", $currentSettings);
            
            return response()->json([
                'success' => true,
                'display_settings' => $currentSettings,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating display settings: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update display settings'], 500);
        }
    }

    /**
     * Get display settings for judge screens
     */
    public function getDisplaySettings(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'No event_id provided'], 400);
            }
            
            $eventId = (int) $eventId;
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            $settings = $votingState 
                ? $votingState->getDisplaySettingsWithDefaults()
                : VotingState::getDefaultDisplaySettings();
            
            $registeredScreens = $votingState?->registered_screens ?? [];
            
            return response()->json([
                'display_settings' => $settings,
                'registered_screens' => $registeredScreens,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting display settings: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get display settings'], 500);
        }
    }

    /**
     * Register a screen/device for judging
     * Devices connecting get randomly assigned an available judge number
     */
    public function registerScreen(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            $deviceId = $request->input('device_id'); // Unique browser/device identifier
            
            if (!$eventId || !$deviceId) {
                return response()->json(['error' => 'event_id and device_id required'], 400);
            }
            
            $eventId = (int) $eventId;
            $ipAddress = $request->ip();
            
            // Get all judges for this event
            $judges = Judge::where('event_id', $eventId)->orderBy('chair_number')->get();
            $judgeCount = $judges->count();
            
            if ($judgeCount === 0) {
                return response()->json([
                    'allowed' => false,
                    'message' => 'No judges configured for this event'
                ]);
            }
            
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                ['registered_screens' => []]
            );
            
            $screens = $votingState->registered_screens ?? [];
            
            // Check if this device is already registered
            $existingScreen = collect($screens)->firstWhere('device_id', $deviceId);
            if ($existingScreen) {
                // Get the judge to return chair_number
                $existingJudge = $judges->firstWhere('id', $existingScreen['judge_id']);
                return response()->json([
                    'allowed' => true,
                    'screen_number' => $existingScreen['screen_number'],
                    'judge_id' => $existingScreen['judge_id'] ?? null,
                    'chair_number' => $existingScreen['chair_number'] ?? $existingJudge?->chair_number,
                    'message' => 'Already registered'
                ]);
            }
            
            // Check if we have room for more screens
            if (count($screens) >= $judgeCount) {
                return response()->json([
                    'allowed' => false,
                    'message' => "All {$judgeCount} judge positions are taken",
                    'max_judges' => $judgeCount
                ]);
            }
            
            // Get list of already assigned judge IDs
            $assignedJudgeIds = collect($screens)->pluck('judge_id')->filter()->toArray();
            
            // Get available judges (not yet assigned to any screen)
            $availableJudges = $judges->filter(function ($judge) use ($assignedJudgeIds) {
                return !in_array($judge->id, $assignedJudgeIds);
            });
            
            // Randomly select one from available judges
            $selectedJudge = $availableJudges->random();
            
            // Screen number is based on registration order (1, 2, 3...)
            $screenNumber = count($screens) + 1;
            
            // Register the new screen
            $screens[] = [
                'screen_number' => $screenNumber,
                'device_id' => $deviceId,
                'judge_id' => $selectedJudge->id,
                'chair_number' => $selectedJudge->chair_number,
                'ip_address' => $ipAddress,
                'connected_at' => now()->toIso8601String(),
            ];
            
            $votingState->registered_screens = $screens;
            $votingState->save();
            
            // Build affected screen data for broadcast
            $affectedScreen = [
                'screen_number' => $screenNumber,
                'device_id' => $deviceId,
                'judge_id' => $selectedJudge->id,
                'chair_number' => $selectedJudge->chair_number,
                'ip_address' => $ipAddress,
            ];
            
            // Broadcast screen registration update using dedicated event
            broadcast(new ScreenRegistrationChanged($eventId, $screens, 'registered', $affectedScreen));
            
            Log::info("Screen {$screenNumber} registered for event {$eventId}", [
                'device_id' => $deviceId,
                'ip' => $ipAddress,
                'judge_id' => $selectedJudge->id,
                'chair_number' => $selectedJudge->chair_number
            ]);
            
            return response()->json([
                'allowed' => true,
                'screen_number' => $screenNumber,
                'judge_id' => $selectedJudge->id,
                'chair_number' => $selectedJudge->chair_number,
                'message' => "Assigned as Judge #{$selectedJudge->chair_number}"
            ]);
        } catch (\Exception $e) {
            Log::error('Error registering screen: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to register screen'], 500);
        }
    }

    /**
     * Get registered screens for an event
     */
    public function getRegisteredScreens(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'No event_id provided'], 400);
            }
            
            $eventId = (int) $eventId;
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            $screens = $votingState?->registered_screens ?? [];
            
            $judgeCount = Judge::where('event_id', $eventId)->count();
            
            return response()->json([
                'registered_screens' => $screens,
                'max_judges' => $judgeCount,
                'available_slots' => $judgeCount - count($screens)
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting registered screens: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get registered screens'], 500);
        }
    }

    /**
     * Get screen status for a specific device
     * Returns current assignment or null if not registered
     * 
     * @OA\Get(
     *     path="/api/judge/screen-status",
     *     tags={"Judge Management"},
     *     summary="Get screen registration status",
     *     description="Returns current assignment for a device or null if not registered",
     *     @OA\Parameter(
     *         name="device_id",
     *         in="query",
     *         description="Unique device identifier",
     *         required=true,
     *         @OA\Schema(type="string", example="uuid-abc123")
     *     ),
     *     @OA\Parameter(
     *         name="event_id",
     *         in="query",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Screen status retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="registered", type="boolean", example=true),
     *             @OA\Property(property="screen_number", type="integer", example=1, nullable=true),
     *             @OA\Property(property="judge_id", type="integer", example=1, nullable=true),
     *             @OA\Property(property="chair_number", type="integer", example=1, nullable=true),
     *             @OA\Property(property="connected_at", type="string", example="2025-12-14T10:30:00Z", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=400, description="Missing required parameters")
     * )
     */
    public function getScreenStatus(Request $request)
    {
        try {
            $eventId = $request->query('event_id');
            $deviceId = $request->query('device_id');
            
            if (!$eventId || !$deviceId) {
                return response()->json(['error' => 'event_id and device_id are required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                return response()->json([
                    'registered' => false,
                    'screen_number' => null,
                    'judge_id' => null,
                    'chair_number' => null,
                    'connected_at' => null
                ]);
            }
            
            $screens = $votingState->registered_screens ?? [];
            
            // Find the screen with matching device_id
            $screen = collect($screens)->firstWhere('device_id', $deviceId);
            
            if (!$screen) {
                return response()->json([
                    'registered' => false,
                    'screen_number' => null,
                    'judge_id' => null,
                    'chair_number' => null,
                    'connected_at' => null
                ]);
            }
            
            return response()->json([
                'registered' => true,
                'screen_number' => $screen['screen_number'] ?? null,
                'judge_id' => $screen['judge_id'] ?? null,
                'chair_number' => $screen['chair_number'] ?? null,
                'connected_at' => $screen['connected_at'] ?? null,
                'ip_address' => $screen['ip_address'] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting screen status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get screen status'], 500);
        }
    }

    /**
     * Clear all registered screens (admin reset)
     */
    public function clearRegisteredScreens(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'No event_id provided'], 400);
            }
            
            $eventId = (int) $eventId;
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if ($votingState) {
                $votingState->registered_screens = [];
                $votingState->save();
            }
            
            // Broadcast to kick all screens using dedicated event
            broadcast(new ScreenRegistrationChanged($eventId, [], 'cleared', null));
            
            Log::info("All registered screens cleared for event {$eventId}");
            
            return response()->json([
                'success' => true,
                'message' => 'All screens cleared'
            ]);
        } catch (\Exception $e) {
            Log::error('Error clearing registered screens: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to clear screens'], 500);
        }
    }

    /**
     * Reassign a screen to a different judge (admin)
     */
    public function reassignScreen(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            $screenNumber = $request->input('screen_number');
            $newJudgeId = $request->input('judge_id');
            
            if (!$eventId || !$screenNumber) {
                return response()->json(['error' => 'event_id and screen_number required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                return response()->json(['error' => 'No voting state found'], 404);
            }
            
            $screens = $votingState->registered_screens ?? [];
            
            // Find and update the screen
            $updated = false;
            foreach ($screens as &$screen) {
                if ($screen['screen_number'] == $screenNumber) {
                    $screen['judge_id'] = $newJudgeId;
                    $updated = true;
                    break;
                }
            }
            
            if (!$updated) {
                return response()->json(['error' => 'Screen not found'], 404);
            }
            
            $votingState->registered_screens = $screens;
            $votingState->save();
            
            // Build affected screen data for broadcast
            $affectedScreen = [
                'screen_number' => $screenNumber,
                'new_judge_id' => $newJudgeId,
            ];
            
            // Broadcast the reassignment using dedicated event
            broadcast(new ScreenRegistrationChanged($eventId, $screens, 'reassigned', $affectedScreen));
            
            return response()->json([
                'success' => true,
                'message' => "Screen {$screenNumber} reassigned"
            ]);
        } catch (\Exception $e) {
            Log::error('Error reassigning screen: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reassign screen'], 500);
        }
    }

    /**
     * Remove a specific screen registration (unregister/kick a screen)
     * Admin can remove a screen from registered list by screen_number or device_id
     * Broadcasts update to all screens
     */
    public function removeScreen(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            $screenNumber = $request->input('screen_number');
            $deviceId = $request->input('device_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'event_id is required'], 400);
            }
            
            if (!$screenNumber && !$deviceId) {
                return response()->json(['error' => 'screen_number or device_id is required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                return response()->json(['error' => 'No voting state found'], 404);
            }
            
            $screens = $votingState->registered_screens ?? [];
            $removedScreen = null;
            
            // Find and remove the screen by screen_number or device_id
            $screens = array_values(array_filter($screens, function($s) use ($screenNumber, $deviceId, &$removedScreen) {
                $shouldRemove = ($screenNumber && $s['screen_number'] == $screenNumber) ||
                               ($deviceId && ($s['device_id'] ?? null) == $deviceId);
                if ($shouldRemove) {
                    $removedScreen = $s;
                }
                return !$shouldRemove;
            }));
            
            if (!$removedScreen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Screen not found'
                ], 404);
            }
            
            $votingState->registered_screens = $screens;
            $votingState->save();
            
            // Clear the judge's scores when kicked
            $judgeId = $removedScreen['judge_id'] ?? null;
            $scoresCleared = 0;
            if ($judgeId) {
                // Get candidate IDs for this event
                $candidateIds = \App\Models\Candidate::where('event_id', $eventId)->pluck('id');
                
                if ($candidateIds->isNotEmpty()) {
                    $scoresCleared = \App\Models\Point::whereIn('candidate_id', $candidateIds)
                        ->where('judge_id', $judgeId)
                        ->delete();
                    
                    Log::info("Cleared {$scoresCleared} scores for judge {$judgeId} in event {$eventId}");
                }
            }
            
            // Broadcast to kick that specific screen and update all screens using dedicated event
            broadcast(new ScreenRegistrationChanged($eventId, $screens, 'unregistered', $removedScreen));
            
            Log::info("Screen removed from event {$eventId}", [
                'screen_number' => $removedScreen['screen_number'],
                'device_id' => $removedScreen['device_id'] ?? null,
                'judge_id' => $removedScreen['judge_id'] ?? null,
                'scores_cleared' => $scoresCleared,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Screen {$removedScreen['screen_number']} removed" . ($scoresCleared > 0 ? " and {$scoresCleared} scores cleared" : ""),
                'removed_screen' => $removedScreen,
                'scores_cleared' => $scoresCleared
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing screen: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to remove screen'], 500);
        }
    }

    /**
     * Swap judge assignments between two registered screens
     * Admin can swap judge numbers between two screens
     * Scores remain tied to judge_id (not screen)
     * 
     * @OA\Post(
     *     path="/api/judge/swap-screens",
     *     tags={"Judge Management"},
     *     summary="Swap judge assignments between two screens",
     *     description="Swaps the judge assignments between two registered screens. Scores remain tied to judge_id.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id", "screen_number_1", "screen_number_2"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID"),
     *             @OA\Property(property="screen_number_1", type="integer", example=1, description="First screen number"),
     *             @OA\Property(property="screen_number_2", type="integer", example=2, description="Second screen number")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Screens swapped successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Judge assignments swapped between Screen 1 and Screen 2"),
     *             @OA\Property(property="screen_1", type="object"),
     *             @OA\Property(property="screen_2", type="object")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Missing required parameters"),
     *     @OA\Response(response=404, description="Screen not found")
     * )
     */
    public function swapScreens(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            $screenNumber1 = $request->input('screen_number_1');
            $screenNumber2 = $request->input('screen_number_2');
            
            if (!$eventId) {
                return response()->json(['error' => 'event_id is required'], 400);
            }
            
            if (!$screenNumber1 || !$screenNumber2) {
                return response()->json(['error' => 'screen_number_1 and screen_number_2 are required'], 400);
            }
            
            if ($screenNumber1 == $screenNumber2) {
                return response()->json(['error' => 'Cannot swap a screen with itself'], 400);
            }
            
            $eventId = (int) $eventId;
            $screenNumber1 = (int) $screenNumber1;
            $screenNumber2 = (int) $screenNumber2;
            
            $votingState = VotingState::where('event_id', $eventId)->first();
            
            if (!$votingState) {
                return response()->json(['error' => 'No voting state found'], 404);
            }
            
            $screens = $votingState->registered_screens ?? [];
            
            // Find both screens
            $screen1Index = null;
            $screen2Index = null;
            
            foreach ($screens as $index => $screen) {
                if ($screen['screen_number'] == $screenNumber1) {
                    $screen1Index = $index;
                }
                if ($screen['screen_number'] == $screenNumber2) {
                    $screen2Index = $index;
                }
            }
            
            if ($screen1Index === null) {
                return response()->json(['error' => "Screen {$screenNumber1} not found"], 404);
            }
            
            if ($screen2Index === null) {
                return response()->json(['error' => "Screen {$screenNumber2} not found"], 404);
            }
            
            // Swap judge_id and chair_number between the two screens
            $tempJudgeId = $screens[$screen1Index]['judge_id'];
            $tempChairNumber = $screens[$screen1Index]['chair_number'];
            
            $screens[$screen1Index]['judge_id'] = $screens[$screen2Index]['judge_id'];
            $screens[$screen1Index]['chair_number'] = $screens[$screen2Index]['chair_number'];
            
            $screens[$screen2Index]['judge_id'] = $tempJudgeId;
            $screens[$screen2Index]['chair_number'] = $tempChairNumber;
            
            $votingState->registered_screens = $screens;
            $votingState->save();
            
            // Build affected screens data for broadcast
            $affectedScreens = [
                'screen_1' => [
                    'screen_number' => $screenNumber1,
                    'new_judge_id' => $screens[$screen1Index]['judge_id'],
                    'new_chair_number' => $screens[$screen1Index]['chair_number'],
                    'device_id' => $screens[$screen1Index]['device_id'] ?? null,
                ],
                'screen_2' => [
                    'screen_number' => $screenNumber2,
                    'new_judge_id' => $screens[$screen2Index]['judge_id'],
                    'new_chair_number' => $screens[$screen2Index]['chair_number'],
                    'device_id' => $screens[$screen2Index]['device_id'] ?? null,
                ],
            ];
            
            // Broadcast the swap using dedicated event
            broadcast(new ScreenRegistrationChanged($eventId, $screens, 'swapped', $affectedScreens));
            
            Log::info("Judge assignments swapped for event {$eventId}", [
                'screen_1' => $screenNumber1,
                'screen_2' => $screenNumber2,
                'screen_1_new_judge' => $screens[$screen1Index]['judge_id'],
                'screen_2_new_judge' => $screens[$screen2Index]['judge_id'],
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Judge assignments swapped between Screen {$screenNumber1} and Screen {$screenNumber2}",
                'screen_1' => $screens[$screen1Index],
                'screen_2' => $screens[$screen2Index],
                'registered_screens' => $screens
            ]);
        } catch (\Exception $e) {
            Log::error('Error swapping screens: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to swap screens'], 500);
        }
    }

    /**
     * Broadcast to judge screens to show their assigned number
     * Admin can trigger all screens or specific judges to display their number
     * 
     * @OA\Post(
     *     path="/api/voting/show-judge-numbers",
     *     tags={"Judge Management"},
     *     summary="Show judge numbers on screens",
     *     description="Broadcasts to judge screens to display their assigned number. Can target all judges or specific ones.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id"},
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID"),
     *             @OA\Property(property="judge_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3}, description="Specific judge IDs to show (empty for all)"),
     *             @OA\Property(property="duration", type="integer", example=5000, description="Duration in milliseconds to show the number (default 5000)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Broadcast sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Show judge numbers broadcast sent"),
     *             @OA\Property(property="target", type="string", example="all")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Missing required parameters")
     * )
     */
    public function showJudgeNumbers(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            $judgeIds = $request->input('judge_ids', []); // Empty array means all judges
            
            if (!$eventId) {
                return response()->json(['error' => 'event_id is required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            // Determine target
            $target = empty($judgeIds) ? 'all' : 'specific';
            
            // Update voting state to track show_judge_numbers
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                ['show_judge_numbers' => false]
            );
            $votingState->show_judge_numbers = true;
            $votingState->save();
            
            // Broadcast to all judge screens
            broadcast(new VotingStateChanged($eventId, [
                'judge_ids' => $judgeIds,
                'target' => $target,
            ], 'show_judge_numbers'));
            
            Log::info("Show judge numbers broadcast for event {$eventId}", [
                'target' => $target,
                'judge_ids' => $judgeIds
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Show judge numbers broadcast sent',
                'target' => $target,
                'show_judge_numbers' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error broadcasting show judge numbers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to broadcast'], 500);
        }
    }

    /**
     * Refresh all judge screens
     */
    public function refreshJudgeScreens(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            $judgeIds = $request->input('judge_ids', []); // Empty array means all judges
            
            if (!$eventId) {
                return response()->json(['error' => 'event_id is required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            // Determine target
            $target = empty($judgeIds) ? 'all' : 'specific';
            
            // Broadcast refresh command to all judge screens
            broadcast(new VotingStateChanged($eventId, [
                'judge_ids' => $judgeIds,
                'target' => $target,
            ], 'refresh_screens'));
            
            Log::info("Refresh screens broadcast for event {$eventId}", [
                'target' => $target,
                'judge_ids' => $judgeIds
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Refresh broadcast sent',
                'target' => $target
            ]);
        } catch (\Exception $e) {
            Log::error('Error broadcasting refresh screens: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to broadcast'], 500);
        }
    }

    /**
     * Hide judge numbers on all screens
     */
    public function hideJudgeNumbers(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'event_id is required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            // Update voting state
            $votingState = VotingState::firstOrCreate(
                ['event_id' => $eventId],
                ['show_judge_numbers' => true]
            );
            $votingState->show_judge_numbers = false;
            $votingState->save();
            
            // Broadcast to all judge screens
            broadcast(new VotingStateChanged($eventId, [], 'hide_judge_numbers'));
            
            Log::info("Hide judge numbers broadcast for event {$eventId}");
            
            return response()->json([
                'success' => true,
                'message' => 'Hide judge numbers broadcast sent',
                'show_judge_numbers' => false
            ]);
        } catch (\Exception $e) {
            Log::error('Error broadcasting hide judge numbers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to broadcast'], 500);
        }
    }

    /**
     * Show network info (IP address) on all judge screens
     */
    public function showNetworkInfo(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'event_id is required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            // Get registered screens with their IPs
            $votingState = VotingState::where('event_id', $eventId)->first();
            $registeredScreens = $votingState?->registered_screens ?? [];
            
            // Build a map of device_id => ip_address
            $screenIps = [];
            foreach ($registeredScreens as $screen) {
                if (!empty($screen['device_id']) && !empty($screen['ip_address'])) {
                    $screenIps[$screen['device_id']] = $screen['ip_address'];
                }
            }
            
            // Broadcast to all judge screens with their IP map
            broadcast(new VotingStateChanged($eventId, [
                'screen_ips' => $screenIps,
            ], 'show_network_info'));
            
            Log::info("Show network info broadcast for event {$eventId}", ['screens' => count($screenIps)]);
            
            return response()->json([
                'success' => true,
                'message' => 'Network info broadcast sent',
                'screens' => count($screenIps)
            ]);
        } catch (\Exception $e) {
            Log::error('Error broadcasting network info: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to broadcast'], 500);
        }
    }
    
    /**
     * Get the server's local IP address (for LAN access)
     */
    private function getServerLocalIp()
    {
        $ip = null;
        
        // Method 1: Check environment variable (most reliable if set)
        $envIp = env('VITE_DEV_SERVER_HOST');
        if ($envIp && $envIp !== 'localhost' && $envIp !== '127.0.0.1') {
            return $envIp;
        }
        
        // Method 2: Try SERVER_ADDR from request
        $serverAddr = request()->server('SERVER_ADDR');
        if ($serverAddr && $serverAddr !== '127.0.0.1' && $serverAddr !== '::1') {
            return $serverAddr;
        }
        
        // Method 3: Try to get from hostname
        $hostname = gethostname();
        $ip = gethostbyname($hostname);
        if ($ip && $ip !== $hostname && $ip !== '127.0.0.1') {
            return $ip;
        }
        
        // Method 4: Windows - try ipconfig
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $output = shell_exec('ipconfig');
            if ($output) {
                // Look for IPv4 Address in the output
                if (preg_match('/IPv4 Address[.\s]*:\s*(\d+\.\d+\.\d+\.\d+)/i', $output, $matches)) {
                    $ip = $matches[1];
                    if ($ip !== '127.0.0.1') {
                        return $ip;
                    }
                }
            }
        } else {
            // Method 5: Linux/Mac - try hostname -I
            $output = shell_exec('hostname -I 2>/dev/null');
            if ($output) {
                $ips = explode(' ', trim($output));
                if (!empty($ips[0]) && $ips[0] !== '127.0.0.1') {
                    return $ips[0];
                }
            }
        }
        
        return $ip ?: 'Unable to detect';
    }

    /**
     * Hide network info on all judge screens
     */
    public function hideNetworkInfo(Request $request)
    {
        try {
            $eventId = $request->input('event_id');
            
            if (!$eventId) {
                return response()->json(['error' => 'event_id is required'], 400);
            }
            
            $eventId = (int) $eventId;
            
            // Broadcast to all judge screens
            broadcast(new VotingStateChanged($eventId, [], 'hide_network_info'));
            
            Log::info("Hide network info broadcast for event {$eventId}");
            
            return response()->json([
                'success' => true,
                'message' => 'Hide network info broadcast sent'
            ]);
        } catch (\Exception $e) {
            Log::error('Error broadcasting hide network info: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to broadcast'], 500);
        }
    }

}
