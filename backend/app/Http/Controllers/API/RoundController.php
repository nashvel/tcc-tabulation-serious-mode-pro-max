<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Round;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoundController extends Controller
{
    public function index(): JsonResponse
    {
        $rounds = Round::with('criteria')->get();
        return response()->json($rounds);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'spot' => 'required|integer',
            'name' => 'required|string|max:120'
        ]);

        $round = Round::create($validated);
        return response()->json($round, 201);
    }

    public function show(string $id): JsonResponse
    {
        $round = Round::with('criteria')->findOrFail($id);
        return response()->json($round);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $round = Round::findOrFail($id);
        
        $validated = $request->validate([
            'spot' => 'sometimes|integer',
            'name' => 'sometimes|string|max:120'
        ]);

        $round->update($validated);
        return response()->json($round);
    }

    public function destroy(string $id): JsonResponse
    {
        $round = Round::findOrFail($id);
        $round->delete();
        return response()->json(null, 204);
    }
}
