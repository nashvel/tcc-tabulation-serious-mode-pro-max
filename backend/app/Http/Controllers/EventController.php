<?php

namespace App\Http\Controllers;

use App\Events\ActiveEventChanged;
use App\Models\Event;
use App\Models\EventDay;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['days', 'results', 'overallWinners']);
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by title if provided
        if ($request->has('title')) {
            $query->where('title', $request->title);
        }
        
        $events = $query->orderBy('year', 'desc')->get();
        return response()->json($events);
    }
    
    public function archive($id)
    {
        $event = Event::findOrFail($id);
        $event->update(['status' => 'archived']);
        
        return response()->json([
            'message' => 'Event archived successfully',
            'event' => $event->load(['days', 'results', 'overallWinners'])
        ]);
    }
    
    public function complete($id, Request $request)
    {
        $event = Event::findOrFail($id);
        
        $validated = $request->validate([
            'overall_winners' => 'required|array',
            'overall_winners.*.title' => 'required|string',
            'overall_winners.*.winner_name' => 'required|string',
            'overall_winners.*.college' => 'nullable|string',
            'overall_winners.*.year_level' => 'nullable|string',
            'results' => 'required|array',
            'results.*.event_day_id' => 'required|exists:event_days,id',
            'results.*.category' => 'required|string',
            'results.*.rank' => 'required|integer',
            'results.*.participant_name' => 'required|string',
            'results.*.college' => 'nullable|string',
            'results.*.score' => 'nullable|numeric',
        ]);
        
        // Save overall winners
        foreach ($validated['overall_winners'] as $winner) {
            $event->overallWinners()->create($winner);
        }
        
        // Save results
        foreach ($validated['results'] as $result) {
            $event->results()->create($result);
        }
        
        // Mark event as completed
        $event->update(['status' => 'completed']);
        
        return response()->json([
            'message' => 'Event completed successfully',
            'event' => $event->load(['days', 'results', 'overallWinners'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'year' => 'required|integer',
            'days' => 'required|array|min:1',
            'days.*.day_number' => 'required|integer',
            'days.*.title' => 'required|string|max:255',
        ]);

        $event = Event::create([
            'title' => $validated['title'],
            'year' => $validated['year'],
        ]);

        foreach ($validated['days'] as $day) {
            EventDay::create([
                'event_id' => $event->id,
                'day_number' => $day['day_number'],
                'title' => $day['title'],
            ]);
        }

        return response()->json($event->load('days'), 201);
    }

    public function show($id)
    {
        $event = Event::with(['days.results', 'results', 'overallWinners'])->findOrFail($id);
        return response()->json($event);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer',
            'days' => 'sometimes|array',
            'days.*.day_number' => 'required_with:days|integer',
            'days.*.title' => 'required_with:days|string|max:255',
        ]);

        $event->update($validated);

        if (isset($validated['days'])) {
            // Delete old days
            $event->days()->delete();

            // Create new days
            foreach ($validated['days'] as $day) {
                EventDay::create([
                    'event_id' => $event->id,
                    'day_number' => $day['day_number'],
                    'title' => $day['title'],
                ]);
            }
        }

        return response()->json($event->load('days'));
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }

    /**
     * Save or update event draft (Step 1)
     */
    public function saveDraft(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'nullable|exists:events,id',
            'title' => 'required|string|max:255',
            'event_date' => 'nullable|date',
            'description' => 'nullable|string',
            'event_type' => 'nullable|string',
            'number_of_judges' => 'nullable|integer|min:1|max:15',
            'event_days' => 'nullable|array',
            'important_people' => 'nullable|array',
        ]);

        // Create or update event
        if ($request->event_id) {
            $event = Event::findOrFail($request->event_id);
            $event->update([
                'title' => $validated['title'],
                'event_date' => $validated['event_date'] ?? null,
                'description' => $validated['description'] ?? null,
                'event_type' => $validated['event_type'] ?? 'pageant',
                'number_of_judges' => $validated['number_of_judges'] ?? null,
                'year' => date('Y'),
            ]);
        } else {
            $event = Event::create([
                'unique_id' => uniqid('evt_'),
                'title' => $validated['title'],
                'event_date' => $validated['event_date'] ?? null,
                'description' => $validated['description'] ?? null,
                'event_type' => $validated['event_type'] ?? 'pageant',
                'number_of_judges' => $validated['number_of_judges'] ?? null,
                'year' => date('Y'),
                'status' => 'active',
            ]);
        }

        // Save event days if provided
        if (!empty($validated['event_days'])) {
            $event->days()->delete();
            foreach ($validated['event_days'] as $day) {
                EventDay::create([
                    'event_id' => $event->id,
                    'day_number' => $day['day_number'] ?? 1,
                    'title' => $day['title'] ?? 'Day 1',
                    'event_type' => $day['event_type'] ?? 'pageant',
                    'participant_type' => $day['participant_type'] ?? 'solo',
                ]);
            }
        }

        // Save important people if provided
        if (!empty($validated['important_people'])) {
            \App\Models\EventImportantPerson::where('event_id', $event->id)->delete();
            foreach ($validated['important_people'] as $person) {
                if (!empty($person['position']) || !empty($person['name'])) {
                    \App\Models\EventImportantPerson::create([
                        'event_id' => $event->id,
                        'position' => $person['position'] ?? '',
                        'name' => $person['name'] ?? '',
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Draft saved successfully',
            'event' => $event->load('days'),
            'event_id' => $event->id
        ]);
    }

    /**
     * Update specific step of event creation
     */
    public function updateStep(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $step = $request->input('step');
        $data = $request->input('data');

        switch ($step) {
            case 2: // Candidates
                if (!empty($data['candidates_by_day'])) {
                    // Clear existing candidates for this event
                    \App\Models\Candidate::where('event_id', $event->id)->delete();
                    
                    foreach ($data['candidates_by_day'] as $dayIndex => $candidates) {
                        foreach ($candidates as $candidate) {
                            if (!empty($candidate['name'])) {
                                \App\Models\Candidate::create([
                                    'event_id' => $event->id,
                                    'event_day_id' => $dayIndex + 1,
                                    'number' => $candidate['number'] ?? 0,
                                    'name' => $candidate['name'],
                                    'gender' => !empty($candidate['gender']) ? $candidate['gender'] : null,
                                    'team_name' => $candidate['team_name'] ?? null,
                                    'department' => $candidate['department'] ?? null,
                                ]);
                            }
                        }
                    }
                }
                break;

            case 3: // Categories (Rounds)
                if (!empty($data['categories'])) {
                    \App\Models\Round::where('event_id', $event->id)->delete();
                    
                    $spot = 1;
                    foreach ($data['categories'] as $category) {
                        if (!empty($category['name'])) {
                            \App\Models\Round::create([
                                'event_id' => $event->id,
                                'name' => $category['name'],
                                'spot' => $spot++,
                            ]);
                        }
                    }
                }
                break;

            case 4: // Criteria
                if (!empty($data['criteria'])) {
                    // Get all rounds for this event
                    $rounds = \App\Models\Round::where('event_id', $event->id)->get();
                    
                    foreach ($rounds as $round) {
                        \App\Models\Criteria::where('round_id', $round->id)->delete();
                    }
                    
                    foreach ($data['criteria'] as $criterion) {
                        if (!empty($criterion['name']) && isset($criterion['category_index'])) {
                            $round = $rounds[$criterion['category_index']] ?? null;
                            if ($round) {
                                \App\Models\Criteria::create([
                                    'round_id' => $round->id,
                                    'name' => $criterion['name'],
                                    'points' => $criterion['max_score'] ?? 100,
                                    'percentage' => $criterion['percentage'] ?? 0,
                                ]);
                            }
                        }
                    }
                }
                break;
        }

        return response()->json([
            'message' => "Step {$step} saved successfully",
            'event' => $event->load(['days', 'candidates', 'rounds.criteria'])
        ]);
    }

    /**
     * Activate event (mark as ready)
     */
    public function activate($id)
    {
        $event = Event::findOrFail($id);
        $event->update(['status' => 'active']);

        return response()->json([
            'message' => 'Event activated successfully',
            'event' => $event
        ]);
    }

    /**
     * Set an event as the active judging event
     * Clears all other events and makes this one active for judges
     */
    public function setActiveForJudging($id)
    {
        $event = Event::findOrFail($id);
        
        // Clear active_round_id from ALL other events WITHOUT updating their timestamps
        \DB::table('voting_states')
            ->where('event_id', '!=', $id)
            ->update(['active_round_id' => null]);
        
        // Get or create voting state for this event
        $votingState = \App\Models\VotingState::firstOrCreate(
            ['event_id' => $id],
            ['is_active' => false, 'is_locked' => false]
        );
        
        // Touch the voting state to update its timestamp (makes it the most recent)
        $votingState->touch();
        
        \Log::info("Event {$id} set as active for judging, updated_at: " . $votingState->updated_at);
        
        // Broadcast to all judges that the active event has changed
        broadcast(new ActiveEventChanged($id, $event->title));
        
        return response()->json([
            'message' => 'Event set as active for judging',
            'event' => $event
        ]);
    }

    /**
     * Get the currently active event for judges
     * Returns the event with the most recently updated voting state
     */
    public function getActiveEvent()
    {
        // Return the event with the most recently updated voting state
        // This is set when admin loads an event via /admin?event_id=X
        $votingState = \App\Models\VotingState::orderBy('updated_at', 'desc')->first();
        
        if ($votingState) {
            $event = Event::find($votingState->event_id);
            if ($event) {
                \Log::info("Returning event from most recent voting state:", [
                    'event_id' => $event->id,
                    'voting_state_updated_at' => $votingState->updated_at
                ]);
                return response()->json($event);
            }
        }

        // Fallback: return the most recently updated active event
        $event = Event::where('status', 'active')
            ->orderBy('updated_at', 'desc')
            ->first();

        if (!$event) {
            return response()->json(null, 404);
        }

        \Log::info("Returning fallback active event:", ['event_id' => $event->id]);
        return response()->json($event);
    }
}
