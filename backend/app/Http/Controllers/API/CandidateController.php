<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Candidates",
 *     description="API Endpoints for managing candidates"
 * )
 */
class CandidateController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/candidates",
     *     tags={"Candidates"},
     *     summary="Get all candidates",
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function index(): JsonResponse
    {
        $candidates = Candidate::with('points')->get();
        return response()->json($candidates);
    }

    /**
     * @OA\Post(
     *     path="/api/candidates",
     *     tags={"Candidates"},
     *     summary="Create a new candidate",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"number","name","gender"},
     *             @OA\Property(property="number", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="BSBA"),
     *             @OA\Property(property="gender", type="string", example="Female")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Candidate created successfully")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'number' => 'required|integer',
            'name' => 'required|string|max:120',
            'gender' => 'required|string|max:6'
        ]);

        $candidate = Candidate::create($validated);
        return response()->json($candidate, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/candidates/{id}",
     *     tags={"Candidates"},
     *     summary="Get a specific candidate",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function show(string $id): JsonResponse
    {
        $candidate = Candidate::with('points')->findOrFail($id);
        return response()->json($candidate);
    }

    /**
     * @OA\Put(
     *     path="/api/candidates/{id}",
     *     tags={"Candidates"},
     *     summary="Update a candidate",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="number", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="gender", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Candidate updated successfully")
     * )
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $candidate = Candidate::findOrFail($id);
        
        $validated = $request->validate([
            'number' => 'sometimes|integer',
            'name' => 'sometimes|string|max:120',
            'gender' => 'sometimes|string|max:6'
        ]);

        $candidate->update($validated);
        return response()->json($candidate);
    }

    /**
     * @OA\Delete(
     *     path="/api/candidates/{id}",
     *     tags={"Candidates"},
     *     summary="Delete a candidate",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Candidate deleted successfully")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $candidate = Candidate::findOrFail($id);
        $candidate->delete();
        return response()->json(null, 204);
    }
}
