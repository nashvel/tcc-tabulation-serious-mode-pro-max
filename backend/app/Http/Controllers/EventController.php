<?php

namespace App\Http\Controllers;

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
}
