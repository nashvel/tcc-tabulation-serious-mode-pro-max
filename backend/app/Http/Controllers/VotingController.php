<?php

namespace App\Http\Controllers;

use App\Events\VotingStateChanged;
use App\Models\VotingSession;
use App\Models\VotingState;
use App\Models\Round;
use App\Models\Criteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VotingController extends Controller
{
    /**
     * Get current voting state
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
     * Start voting session
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
     * Stop voting session
     */
    public function stop(Request $request)
    {
        try {
            $eventId = $request->input('event_id', 1);

            DB::beginTransaction();

            $votingState = VotingState::where('event_id', $eventId)->first();

            if (!$votingState || !$votingState->is_active) {
                return response()->json(['error' => 'No active voting session'], 400);
            }

            // Complete the active session
            if ($votingState->active_session_id) {
                $session = VotingSession::find($votingState->active_session_id);
                if ($session) {
                    $session->update([
                        'ended_at' => now(),
                        'status' => 'completed',
                        'metadata' => [
                            'completed_by' => $request->user()->id ?? 'admin',
                            'rounds_completed' => $votingState->active_round_name,
                        ],
                    ]);
                }
            }

            // Reset voting state
            $votingState->update([
                'is_active' => false,
                'active_session_id' => null,
                'active_round_id' => null,
                'active_round_name' => null,
                'active_criteria' => null,
            ]);

            DB::commit();

            // Broadcast the change
            broadcast(new VotingStateChanged($eventId, [
                'is_active' => false,
                'active_session' => null,
                'active_round' => null,
            ], 'stopped'));

            return response()->json([
                'message' => 'Voting stopped and session documented successfully',
                'voting_state' => $votingState,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error stopping voting: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to stop voting: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Activate a round/category
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

            $votingState = VotingState::where('event_id', $eventId)->first();

            if (!$votingState || !$votingState->is_active) {
                return response()->json(['error' => 'No active voting session'], 400);
            }

            $round = Round::with('criteria')->findOrFail($roundId);

            // Update voting state with active round
            $votingState->update([
                'active_round_id' => $round->id,
                'active_round_name' => $round->name,
                'active_criteria' => $round->criteria->toArray(),
            ]);

            // Update session with round info
            if ($votingState->active_session_id) {
                VotingSession::where('id', $votingState->active_session_id)->update([
                    'round_id' => $round->id,
                    'round_name' => $round->name,
                ]);
            }

            DB::commit();

            // Broadcast the change
            broadcast(new VotingStateChanged($eventId, [
                'is_active' => true,
                'active_session' => $votingState->activeSession,
                'active_round' => [
                    'id' => $round->id,
                    'name' => $round->name,
                    'spot' => $round->spot,
                    'criteria' => $round->criteria,
                ],
            ], 'round_changed'));

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
     * Lock screen
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
     * Unlock screen
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
     * Get voting history
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
}
