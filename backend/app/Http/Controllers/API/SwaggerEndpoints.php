<?php

namespace App\Http\Controllers\API;

/**
 * AUTHENTICATION ENDPOINTS
 */

/**
 * @OA\Post(
 *     path="/admin/login",
 *     tags={"Authentication"},
 *     summary="Admin Login",
 *     description="Authenticate admin user with email and PIN",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"email","pin"},
 *             @OA\Property(property="email", type="string", format="email", example="admin@tcc.com"),
 *             @OA\Property(property="pin", type="string", example="1234")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Login successful",
 *         @OA\JsonContent(
 *             @OA\Property(property="token", type="string", example="1|abcdef123456"),
 *             @OA\Property(property="user", type="object")
 *         )
 *     ),
 *     @OA\Response(response=401, description="Invalid credentials")
 * )
 */

/**
 * @OA\Post(
 *     path="/admin/change-pin",
 *     tags={"Authentication"},
 *     summary="Change Admin PIN",
 *     description="Change the admin PIN",
 *     security={{"bearer":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"old_pin","new_pin"},
 *             @OA\Property(property="old_pin", type="string", example="1234"),
 *             @OA\Property(property="new_pin", type="string", example="5678")
 *         )
 *     ),
 *     @OA\Response(response=200, description="PIN changed successfully"),
 *     @OA\Response(response=401, description="Unauthorized")
 * )
 */

/**
 * EVENTS ENDPOINTS
 */

/**
 * @OA\Get(
 *     path="/events",
 *     tags={"Events"},
 *     summary="List all events",
 *     description="Get paginated list of all events",
 *     @OA\Parameter(
 *         name="page",
 *         in="query",
 *         description="Page number",
 *         required=false,
 *         @OA\Schema(type="integer", default=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of events",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Event")
 *         )
 *     )
 * )
 */

/**
 * @OA\Get(
 *     path="/events/active",
 *     tags={"Events"},
 *     summary="Get active event",
 *     description="Get the currently active event",
 *     @OA\Response(
 *         response=200,
 *         description="Active event",
 *         @OA\JsonContent(ref="#/components/schemas/Event")
 *     ),
 *     @OA\Response(response=404, description="No active event")
 * )
 */

/**
 * @OA\Get(
 *     path="/events/{id}",
 *     tags={"Events"},
 *     summary="Get event details",
 *     description="Get detailed information about a specific event",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Event ID",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Event details",
 *         @OA\JsonContent(ref="#/components/schemas/Event")
 *     ),
 *     @OA\Response(response=404, description="Event not found")
 * )
 */

/**
 * @OA\Post(
 *     path="/events",
 *     tags={"Events"},
 *     summary="Create event",
 *     description="Create a new event (admin only)",
 *     security={{"bearer":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"title","year","date"},
 *             @OA\Property(property="title", type="string", example="Miss Universe 2024"),
 *             @OA\Property(property="year", type="integer", example=2024),
 *             @OA\Property(property="date", type="string", format="date", example="2024-11-21")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Event created",
 *         @OA\JsonContent(ref="#/components/schemas/Event")
 *     ),
 *     @OA\Response(response=401, description="Unauthorized")
 * )
 */

/**
 * @OA\Post(
 *     path="/events/{id}/activate",
 *     tags={"Events"},
 *     summary="Activate event",
 *     description="Activate an event to start judging",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Event ID",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Event activated"),
 *     @OA\Response(response=404, description="Event not found")
 * )
 */

/**
 * @OA\Post(
 *     path="/events/{id}/complete",
 *     tags={"Events"},
 *     summary="Mark event as complete",
 *     description="Mark event as complete (admin only)",
 *     security={{"bearer":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Event ID",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Event marked as complete"),
 *     @OA\Response(response=401, description="Unauthorized")
 * )
 */

/**
 * CANDIDATES ENDPOINTS
 */

/**
 * @OA\Get(
 *     path="/candidates",
 *     tags={"Candidates"},
 *     summary="List candidates",
 *     description="Get list of candidates for an event",
 *     @OA\Parameter(
 *         name="event_id",
 *         in="query",
 *         description="Filter by event ID",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of candidates",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Candidate")
 *         )
 *     )
 * )
 */

/**
 * @OA\Post(
 *     path="/candidates",
 *     tags={"Candidates"},
 *     summary="Create candidate",
 *     description="Create a new candidate (admin only)",
 *     security={{"bearer":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id","number","name"},
 *             @OA\Property(property="event_id", type="integer", example=1),
 *             @OA\Property(property="number", type="integer", example=1),
 *             @OA\Property(property="name", type="string", example="Maria Santos"),
 *             @OA\Property(property="gender", type="string", example="Female")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Candidate created",
 *         @OA\JsonContent(ref="#/components/schemas/Candidate")
 *     ),
 *     @OA\Response(response=401, description="Unauthorized")
 * )
 */

/**
 * VOTING ENDPOINTS
 */

/**
 * @OA\Get(
 *     path="/voting/state",
 *     tags={"Voting"},
 *     summary="Get voting state",
 *     description="Get current voting state including active round and lock status",
 *     @OA\Parameter(
 *         name="event_id",
 *         in="query",
 *         description="Event ID",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Current voting state",
 *         @OA\JsonContent(ref="#/components/schemas/VotingState")
 *     )
 * )
 */

/**
 * @OA\Post(
 *     path="/voting/activate-round",
 *     tags={"Voting"},
 *     summary="Activate round",
 *     description="Activate a specific round for judging",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id","round_id"},
 *             @OA\Property(property="event_id", type="integer", example=1),
 *             @OA\Property(property="round_id", type="integer", example=1)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Round activated"),
 *     @OA\Response(response=404, description="Round not found")
 * )
 */

/**
 * @OA\Post(
 *     path="/voting/lock",
 *     tags={"Voting"},
 *     summary="Lock judge screens",
 *     description="Lock all judge screens",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id"},
 *             @OA\Property(property="event_id", type="integer", example=1)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Screens locked"),
 *     @OA\Response(response=404, description="Event not found")
 * )
 */

/**
 * @OA\Post(
 *     path="/voting/unlock",
 *     tags={"Voting"},
 *     summary="Unlock judge screens",
 *     description="Unlock all judge screens",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id"},
 *             @OA\Property(property="event_id", type="integer", example=1)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Screens unlocked"),
 *     @OA\Response(response=404, description="Event not found")
 * )
 */

/**
 * @OA\Get(
 *     path="/occupied-judges",
 *     tags={"Voting"},
 *     summary="Get occupied judges",
 *     description="Get list of currently occupied judge slots",
 *     @OA\Parameter(
 *         name="event_id",
 *         in="query",
 *         description="Event ID",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of occupied judges",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(
 *                 @OA\Property(property="judge_id", type="integer"),
 *                 @OA\Property(property="occupied", type="boolean")
 *             )
 *         )
 *     )
 * )
 */

/**
 * @OA\Post(
 *     path="/occupy-judge",
 *     tags={"Voting"},
 *     summary="Occupy judge slot",
 *     description="Mark a judge slot as occupied",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id","judge_id"},
 *             @OA\Property(property="event_id", type="integer", example=1),
 *             @OA\Property(property="judge_id", type="integer", example=1)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Judge slot occupied"),
 *     @OA\Response(response=400, description="Judge slot already occupied")
 * )
 */

/**
 * @OA\Post(
 *     path="/clear-occupied-judges",
 *     tags={"Voting"},
 *     summary="Clear occupied judges",
 *     description="Clear all occupied judge slots for an event",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id"},
 *             @OA\Property(property="event_id", type="integer", example=1)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Occupied judges cleared"),
 *     @OA\Response(response=404, description="Event not found")
 * )
 */

/**
 * POINTS ENDPOINTS
 */

/**
 * @OA\Get(
 *     path="/points",
 *     tags={"Points"},
 *     summary="List scores",
 *     description="Get list of all submitted scores",
 *     @OA\Parameter(
 *         name="event_id",
 *         in="query",
 *         description="Filter by event ID",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Parameter(
 *         name="round_id",
 *         in="query",
 *         description="Filter by round ID",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of scores",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Point")
 *         )
 *     )
 * )
 */

/**
 * @OA\Post(
 *     path="/points",
 *     tags={"Points"},
 *     summary="Submit score",
 *     description="Submit or update a judge's score for a candidate",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"judge_id","candidate_id","round_id","criteria_id","points"},
 *             @OA\Property(property="judge_id", type="integer", example=1),
 *             @OA\Property(property="candidate_id", type="integer", example=1),
 *             @OA\Property(property="round_id", type="integer", example=1),
 *             @OA\Property(property="criteria_id", type="integer", example=1),
 *             @OA\Property(property="points", type="number", format="float", example=85.5)
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Score submitted",
 *         @OA\JsonContent(ref="#/components/schemas/Point")
 *     ),
 *     @OA\Response(response=422, description="Validation error")
 * )
 */

/**
 * @OA\Get(
 *     path="/scoreboard",
 *     tags={"Points"},
 *     summary="Get scoreboard",
 *     description="Get aggregated scores for scoreboard display",
 *     @OA\Parameter(
 *         name="event_id",
 *         in="query",
 *         description="Event ID",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Scoreboard data",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(
 *                 @OA\Property(property="candidate_id", type="integer"),
 *                 @OA\Property(property="candidate_name", type="string"),
 *                 @OA\Property(property="total_score", type="number", format="float"),
 *                 @OA\Property(property="rank", type="integer")
 *             )
 *         )
 *     )
 * )
 */

/**
 * EVENT SEQUENCE ENDPOINTS
 */

/**
 * @OA\Get(
 *     path="/event-sequence",
 *     tags={"Event Sequence"},
 *     summary="Get event sequence",
 *     description="Get the ordered list of rounds for an event",
 *     @OA\Parameter(
 *         name="event_id",
 *         in="query",
 *         description="Event ID",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Event sequence",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/EventSequence")
 *         )
 *     )
 * )
 */

/**
 * @OA\Post(
 *     path="/event-sequence",
 *     tags={"Event Sequence"},
 *     summary="Add round to sequence",
 *     description="Add a round to the event sequence",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id","round_id"},
 *             @OA\Property(property="event_id", type="integer", example=1),
 *             @OA\Property(property="round_id", type="integer", example=1)
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Round added to sequence",
 *         @OA\JsonContent(ref="#/components/schemas/EventSequence")
 *     )
 * )
 */

/**
 * @OA\Post(
 *     path="/event-sequence/reorder",
 *     tags={"Event Sequence"},
 *     summary="Reorder sequence",
 *     description="Reorder rounds in the event sequence",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"event_id","sequence"},
 *             @OA\Property(property="event_id", type="integer", example=1),
 *             @OA\Property(
 *                 property="sequence",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(property="id", type="integer"),
 *                     @OA\Property(property="order", type="integer")
 *                 )
 *             )
 *         )
 *     ),
 *     @OA\Response(response=200, description="Sequence reordered")
 * )
 */

class SwaggerEndpoints
{
    // This class contains only Swagger documentation
    // All endpoints are implemented in their respective controllers
}
