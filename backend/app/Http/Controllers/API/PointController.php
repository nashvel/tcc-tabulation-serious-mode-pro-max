<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Point;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PointController extends Controller
{
    public function index(): JsonResponse
    {
        $points = Point::with(['candidate', 'round', 'criteria'])->get();
        return response()->json($points);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'round_id' => 'required|exists:rounds,id',
            'criteria_id' => 'required|exists:criteria,id',
            'points' => 'required|integer',
            'judge_id' => 'required|integer',
            'category' => 'required|string|max:6'
        ]);

        // Check if point already exists for this combination
        $existing = Point::where('candidate_id', $validated['candidate_id'])
            ->where('round_id', $validated['round_id'])
            ->where('criteria_id', $validated['criteria_id'])
            ->where('judge_id', $validated['judge_id'])
            ->where('category', $validated['category'])
            ->first();

        if ($existing) {
            $existing->update(['points' => $validated['points']]);
            return response()->json($existing);
        }

        $point = Point::create($validated);
        return response()->json($point, 201);
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
            'judge_id' => 'sometimes|integer',
            'category' => 'sometimes|string|max:6'
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
        $category = $request->query('category');

        $query = Point::with(['candidate', 'criteria'])
            ->selectRaw('candidate_id, SUM(points) as total_points')
            ->groupBy('candidate_id');

        if ($roundId) {
            $query->where('round_id', $roundId);
        }

        if ($category) {
            $query->where('category', $category);
        }

        $scores = $query->orderBy('total_points', 'desc')->get();
        return response()->json($scores);
    }
}
