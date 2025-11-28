<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Criteria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CriteriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Criteria::with('round');

        if ($request->has('event_id')) {
            $eventId = $request->input('event_id');
            $query->whereHas('round', function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            });
        }

        $criteria = $query->get();
        return response()->json($criteria);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'round_id' => 'required|exists:rounds,id',
            'name' => 'required|string|max:120',
            'points' => 'required|integer'
        ]);

        $criteria = Criteria::create($validated);
        return response()->json($criteria, 201);
    }

    public function show(string $id): JsonResponse
    {
        $criteria = Criteria::with('round')->findOrFail($id);
        return response()->json($criteria);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $criteria = Criteria::findOrFail($id);
        
        $validated = $request->validate([
            'round_id' => 'sometimes|exists:rounds,id',
            'name' => 'sometimes|string|max:120',
            'points' => 'sometimes|integer'
        ]);

        $criteria->update($validated);
        return response()->json($criteria);
    }

    public function destroy(string $id): JsonResponse
    {
        $criteria = Criteria::findOrFail($id);
        $criteria->delete();
        return response()->json(null, 204);
    }
}
