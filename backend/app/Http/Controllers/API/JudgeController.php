<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Judge;
use App\Models\VotingState;
use App\Events\VotingStateChanged;
use App\Events\ScreenRegistrationChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JudgeController extends Controller
{
    /**
     * Get all judges for an event
     */
    public function index(Request $request)
    {
        $eventId = $request->query('event_id');
        
        if (!$eventId) {
            return response()->json([
                'error' => 'event_id is required'
            ], 400);
        }
        
        $judges = Judge::where('event_id', $eventId)
            ->orderBy('chair_number')
            ->get();
        
        return response()->json($judges);
    }

    /**
     * Get a specific judge
     */
    public function show(Judge $judge)
    {
        return response()->json($judge);
    }

    /**
     * Create a new judge
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'name' => 'required|string',
            'chair_number' => 'required|integer',
            'status' => 'nullable|string|in:active,idle,locked'
        ]);

        $judge = Judge::create($validated);
        
        return response()->json($judge, 201);
    }

    /**
     * Update a judge
     */
    public function update(Request $request, Judge $judge)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'chair_number' => 'sometimes|integer',
            'status' => 'sometimes|string|in:active,idle,locked'
        ]);

        $judge->update($validated);
        
        return response()->json($judge);
    }

    /**
     * Delete a judge
     */
    public function destroy(Judge $judge)
    {
        $judge->delete();
        
        return response()->json(['message' => 'Judge deleted successfully']);
    }

    /**
     * Swap chair numbers between two judges
     */
    public function swapChairs(Request $request)
    {
        $validated = $request->validate([
            'judge1_id' => 'required|exists:judges,id',
            'judge2_id' => 'required|exists:judges,id|different:judge1_id',
        ]);

        $judge1 = Judge::findOrFail($validated['judge1_id']);
        $judge2 = Judge::findOrFail($validated['judge2_id']);

        // Ensure both judges belong to the same event
        if ($judge1->event_id !== $judge2->event_id) {
            return response()->json([
                'error' => 'Judges must belong to the same event'
            ], 400);
        }

        // Swap chair numbers using a temporary value to avoid unique constraint violation
        $chair1 = $judge1->chair_number;
        $chair2 = $judge2->chair_number;
        
        // Use a transaction with temporary negative value to avoid constraint
        \DB::transaction(function () use ($judge1, $judge2, $chair1, $chair2) {
            // Set judge1 to a temporary negative value (won't conflict)
            $judge1->chair_number = -1;
            $judge1->save();
            
            // Set judge2 to judge1's original chair
            $judge2->chair_number = $chair1;
            $judge2->save();
            
            // Set judge1 to judge2's original chair
            $judge1->chair_number = $chair2;
            $judge1->save();
        });

        // Refresh models
        $judge1->refresh();
        $judge2->refresh();

        $eventId = $judge1->event_id;

        // Also swap the judge assignments in registered_screens
        $votingState = VotingState::where('event_id', $eventId)->first();
        $swappedScreens = null;
        $screensSwapped = false;
        
        if ($votingState) {
            $screens = $votingState->registered_screens ?? [];
            
            // Find screens assigned to these judges
            $screen1Index = null;
            $screen2Index = null;
            
            foreach ($screens as $index => $screen) {
                if ($screen['judge_id'] == $judge1->id) {
                    $screen1Index = $index;
                } elseif ($screen['judge_id'] == $judge2->id) {
                    $screen2Index = $index;
                }
            }
            
            // Swap judge assignments if both screens exist
            if ($screen1Index !== null && $screen2Index !== null) {
                // Swap judge_id and use the NEW chair numbers from the refreshed judge models
                $tempJudgeId = $screens[$screen1Index]['judge_id'];
                
                $screens[$screen1Index]['judge_id'] = $screens[$screen2Index]['judge_id'];
                // Use judge2's NEW chair number (after the swap)
                $screens[$screen1Index]['chair_number'] = $judge2->chair_number;
                
                $screens[$screen2Index]['judge_id'] = $tempJudgeId;
                // Use judge1's NEW chair number (after the swap)
                $screens[$screen2Index]['chair_number'] = $judge1->chair_number;
                
                $votingState->registered_screens = $screens;
                $votingState->save();
                
                $swappedScreens = [
                    'screen_1' => $screens[$screen1Index],
                    'screen_2' => $screens[$screen2Index],
                ];
                
                Log::info("Screen registrations swapped", [
                    'screen1' => $screens[$screen1Index],
                    'screen2' => $screens[$screen2Index]
                ]);
                
                // Broadcast screen registration change so judge screens update
                broadcast(new ScreenRegistrationChanged($eventId, $screens, 'swapped', $swappedScreens));
                $screensSwapped = true;
            }
            // Handle partial swap - only one screen is registered
            elseif ($screen1Index !== null || $screen2Index !== null) {
                $screenIndex = $screen1Index !== null ? $screen1Index : $screen2Index;
                $currentJudgeId = $screens[$screenIndex]['judge_id'];
                
                // Determine which judge to swap to
                $newJudgeId = $currentJudgeId == $judge1->id ? $judge2->id : $judge1->id;
                $newJudge = $currentJudgeId == $judge1->id ? $judge2 : $judge1;
                
                // Update the screen to the other judge
                $screens[$screenIndex]['judge_id'] = $newJudgeId;
                $screens[$screenIndex]['chair_number'] = $newJudge->chair_number;
                
                $votingState->registered_screens = $screens;
                $votingState->save();
                
                $swappedScreens = [
                    'screen_1' => $screens[$screenIndex],
                    'screen_2' => null, // Only one screen involved
                ];
                
                Log::info("Single screen reassigned during swap", [
                    'screen' => $screens[$screenIndex],
                    'from_judge' => $currentJudgeId,
                    'to_judge' => $newJudgeId
                ]);
                
                // Broadcast screen registration change
                broadcast(new ScreenRegistrationChanged($eventId, $screens, 'swapped', $swappedScreens));
                $screensSwapped = true;
            }
        }

        // Only broadcast refresh_screens if we couldn't swap screen registrations
        // (e.g., manual mode where screens aren't registered)
        if (!$screensSwapped) {
            broadcast(new VotingStateChanged($eventId, [
                'judge_ids' => [$judge1->id, $judge2->id],
                'target' => 'specific',
                'swapped_chairs' => [
                    'judge1' => ['id' => $judge1->id, 'new_chair' => $judge1->chair_number],
                    'judge2' => ['id' => $judge2->id, 'new_chair' => $judge2->chair_number],
                ]
            ], 'refresh_screens'));
        }

        Log::info("Judge chairs swapped and screens refreshed", [
            'event_id' => $eventId,
            'judge1' => $judge1->id,
            'judge2' => $judge2->id
        ]);

        return response()->json([
            'message' => 'Chairs swapped successfully',
            'judge1' => $judge1,
            'judge2' => $judge2,
            'swapped_screens' => $swappedScreens
        ]);
    }
}
