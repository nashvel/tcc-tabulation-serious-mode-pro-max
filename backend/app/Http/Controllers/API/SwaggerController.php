<?php

namespace App\Http\Controllers\API;

/**
 * @OA\Info(
 *    title="TCC Tabulation System API",
 *    version="2.0.0",
 *    description="Comprehensive REST API for the TCC Tabulation System - Real-time event tabulation and judging platform",
 *    contact={
 *        "name": "TCC Development Team",
 *        "url": "https://github.com/nashvel/tcc-tabulation-serious-mode-pro-max"
 *    },
 *    license={
 *        "name": "Proprietary",
 *        "url": "https://github.com/nashvel/tcc-tabulation-serious-mode-pro-max"
 *    }
 * )
 * 
 * @OA\Server(
 *    url="http://localhost:8000/api",
 *    description="Local Development Server"
 * )
 * 
 * @OA\Server(
 *    url="https://api.tcc-tabulation.com/api",
 *    description="Production Server"
 * )
 * 
 * @OA\SecurityScheme(
 *    type="http",
 *    description="Login with admin credentials to get the authentication token",
 *    name="Token based based security",
 *    in="header",
 *    scheme="bearer",
 *    bearerFormat="JWT",
 *    securityScheme="bearer",
 * )
 */

/**
 * @OA\Tag(
 *     name="Authentication",
 *     description="Admin authentication endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Events",
 *     description="Event management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Candidates",
 *     description="Candidate management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Rounds",
 *     description="Round/Category management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Criteria",
 *     description="Scoring criteria endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Voting",
 *     description="Voting state and judge management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Points",
 *     description="Score submission and retrieval endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Event Sequence",
 *     description="Event round ordering endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Templates",
 *     description="Reusable event template endpoints"
 * )
 */

/**
 * @OA\Schema(
 *     schema="Event",
 *     type="object",
 *     properties={
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="title", type="string", example="Miss Universe 2024"),
 *         @OA\Property(property="year", type="integer", example=2024),
 *         @OA\Property(property="date", type="string", format="date", example="2024-11-21"),
 *         @OA\Property(property="status", type="string", enum={"draft", "active", "completed", "archived"}, example="active"),
 *         @OA\Property(property="created_at", type="string", format="date-time"),
 *         @OA\Property(property="updated_at", type="string", format="date-time")
 *     }
 * )
 * 
 * @OA\Schema(
 *     schema="Candidate",
 *     type="object",
 *     properties={
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="event_id", type="integer", example=1),
 *         @OA\Property(property="number", type="integer", example=1),
 *         @OA\Property(property="name", type="string", example="Maria Santos"),
 *         @OA\Property(property="gender", type="string", example="Female"),
 *         @OA\Property(property="created_at", type="string", format="date-time"),
 *         @OA\Property(property="updated_at", type="string", format="date-time")
 *     }
 * )
 * 
 * @OA\Schema(
 *     schema="Round",
 *     type="object",
 *     properties={
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="event_id", type="integer", example=1),
 *         @OA\Property(property="name", type="string", example="Preliminary"),
 *         @OA\Property(property="spot", type="integer", example=1),
 *         @OA\Property(property="created_at", type="string", format="date-time"),
 *         @OA\Property(property="updated_at", type="string", format="date-time")
 *     }
 * )
 * 
 * @OA\Schema(
 *     schema="Criteria",
 *     type="object",
 *     properties={
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="round_id", type="integer", example=1),
 *         @OA\Property(property="name", type="string", example="Presentation"),
 *         @OA\Property(property="max_points", type="integer", example=100),
 *         @OA\Property(property="created_at", type="string", format="date-time"),
 *         @OA\Property(property="updated_at", type="string", format="date-time")
 *     }
 * )
 * 
 * @OA\Schema(
 *     schema="VotingState",
 *     type="object",
 *     properties={
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="event_id", type="integer", example=1),
 *         @OA\Property(property="is_active", type="boolean", example=true),
 *         @OA\Property(property="is_locked", type="boolean", example=false),
 *         @OA\Property(property="active_round_id", type="integer", nullable=true, example=1),
 *         @OA\Property(property="active_round_name", type="string", nullable=true, example="Preliminary"),
 *         @OA\Property(property="created_at", type="string", format="date-time"),
 *         @OA\Property(property="updated_at", type="string", format="date-time")
 *     }
 * )
 * 
 * @OA\Schema(
 *     schema="Point",
 *     type="object",
 *     properties={
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="judge_id", type="integer", example=1),
 *         @OA\Property(property="candidate_id", type="integer", example=1),
 *         @OA\Property(property="round_id", type="integer", example=1),
 *         @OA\Property(property="criteria_id", type="integer", example=1),
 *         @OA\Property(property="points", type="number", format="float", example=85.5),
 *         @OA\Property(property="created_at", type="string", format="date-time"),
 *         @OA\Property(property="updated_at", type="string", format="date-time")
 *     }
 * )
 * 
 * @OA\Schema(
 *     schema="EventSequence",
 *     type="object",
 *     properties={
 *         @OA\Property(property="id", type="integer", example=1),
 *         @OA\Property(property="event_id", type="integer", example=1),
 *         @OA\Property(property="round_id", type="integer", example=1),
 *         @OA\Property(property="order", type="integer", example=1),
 *         @OA\Property(property="created_at", type="string", format="date-time"),
 *         @OA\Property(property="updated_at", type="string", format="date-time")
 *     }
 * )
 */

class SwaggerController
{
    // This controller is only for Swagger documentation
    // All actual endpoints are defined in routes/api.php
}
