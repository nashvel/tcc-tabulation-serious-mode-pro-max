<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="TCC Tabulation System API",
 *     version="2.0.0",
 *     description="REST API for TCC Tabulation System - Real-time Pageant/Event Scoring Application with WebSocket support via Laravel Reverb",
 *     @OA\Contact(
 *         email="support@tcc-tabulation.com",
 *         name="TCC Tabulation Support"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Local Development Server"
 * )
 * @OA\Server(
 *     url="http://192.168.1.100:8000",
 *     description="LAN Access Server (replace with your IP)"
 * )
 * @OA\Tag(
 *     name="Authentication",
 *     description="Admin authentication endpoints"
 * )
 * @OA\Tag(
 *     name="Events",
 *     description="Event management endpoints"
 * )
 * @OA\Tag(
 *     name="Judges",
 *     description="Judge management and screen registration"
 * )
 * @OA\Tag(
 *     name="Voting",
 *     description="Voting state, round control, and display settings"
 * )
 * @OA\Tag(
 *     name="Scoring",
 *     description="Score submission and retrieval"
 * )
 * @OA\Tag(
 *     name="Candidates",
 *     description="Candidate management"
 * )
 * @OA\Tag(
 *     name="Rounds",
 *     description="Round and criteria management"
 * )
 * @OA\Tag(
 *     name="Templates",
 *     description="Event templates and themes"
 * )
 * @OA\Tag(
 *     name="Reports",
 *     description="Reports and activity logs"
 * )
 */
abstract class Controller
{
    //
}
