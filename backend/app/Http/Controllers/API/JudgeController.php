<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Judge;
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

        // Swap chair numbers atomically
        $tempChair = $judge1->chair_number;
        $judge1->chair_number = $judge2->chair_number;
        $judge2->chair_number = $tempChair;

        $judge1->save();
        $judge2->save();

        return response()->json([
            'message' => 'Chairs swapped successfully',
            'judge1' => $judge1,
            'judge2' => $judge2
        ]);
    }
}
