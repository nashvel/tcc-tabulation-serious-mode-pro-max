<?php

use App\Http\Controllers\API\CandidateController;
use App\Http\Controllers\API\RoundController;
use App\Http\Controllers\API\CriteriaController;
use App\Http\Controllers\API\PointController;
use App\Http\Controllers\API\JudgeController;
use App\Http\Controllers\API\TemplateController;
use App\Http\Controllers\API\CandidateTemplateController;
use App\Http\Controllers\API\EventTemplateController;
use App\Http\Controllers\API\EventThemeController;
use App\Http\Controllers\API\ActivityLogController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\VotingController;
use App\Http\Controllers\EventSequenceController;
use Illuminate\Support\Facades\Route;

// Admin Authentication (public routes)
Route::post('admin/login', [AdminAuthController::class, 'login']);
Route::post('admin/change-pin', [AdminAuthController::class, 'changePin']);

// Public Events Routes (no auth needed)
Route::get('events', [EventController::class, 'index']);
Route::get('events/active', [EventController::class, 'getActiveEvent']);
Route::get('events/{event}', [EventController::class, 'show']);
Route::post('events/{id}/activate', [EventController::class, 'activate']);
Route::post('events/{id}/set-active-for-judging', [EventController::class, 'setActiveForJudging']);

// Public Data Routes (no auth needed)
Route::get('candidates', [CandidateController::class, 'index']);
Route::get('rounds', [RoundController::class, 'index']);
Route::get('criteria', [CriteriaController::class, 'index']);
Route::get('points', [PointController::class, 'index']);
Route::post('points', [PointController::class, 'store']); // Judges submit scores (no auth needed)
Route::post('points/batch', [PointController::class, 'storeBatch']); // Batch score submission (optimized)
Route::get('judges', [JudgeController::class, 'index']);
Route::post('judges', [JudgeController::class, 'store']);
Route::put('judges/{judge}', [JudgeController::class, 'update']);
Route::delete('judges/{judge}', [JudgeController::class, 'destroy']);
Route::post('judges/swap-chairs', [JudgeController::class, 'swapChairs']);
Route::get('scoreboard', [PointController::class, 'getScoreboard']);

// Judge Screen Registration (alias for voting/register-screen)
Route::post('judge/register-screen', [VotingController::class, 'registerScreen']);
Route::get('judge/screen-status', [VotingController::class, 'getScreenStatus']);
Route::post('judge/unregister-screen', [VotingController::class, 'removeScreen']);
Route::get('judge/registered-screens', [VotingController::class, 'getRegisteredScreens']);
Route::post('judge/clear-screens', [VotingController::class, 'clearRegisteredScreens']);
Route::post('judge/swap-screens', [VotingController::class, 'swapScreens']);

// Public Voting & Event Sequence Routes (no auth needed)
Route::get('voting/state', [VotingController::class, 'getState']);
Route::get('voting/history', [VotingController::class, 'getHistory']);
Route::post('voting/start-first-round', [VotingController::class, 'startFirstRound']);
Route::post('voting/activate-round', [VotingController::class, 'activateRound']);
Route::post('voting/lock', [VotingController::class, 'lock']);
Route::post('voting/unlock', [VotingController::class, 'unlock']);
Route::get('voting/display-settings', [VotingController::class, 'getDisplaySettings']);
Route::post('voting/display-settings', [VotingController::class, 'updateDisplaySettings']);
Route::post('voting/show-judge-numbers', [VotingController::class, 'showJudgeNumbers']);

// Screen Registration Routes (for auto-assigning judge screens)
Route::post('voting/register-screen', [VotingController::class, 'registerScreen']);
Route::get('voting/registered-screens', [VotingController::class, 'getRegisteredScreens']);
Route::post('voting/clear-screens', [VotingController::class, 'clearRegisteredScreens']);
Route::post('voting/reassign-screen', [VotingController::class, 'reassignScreen']);
Route::post('voting/remove-screen', [VotingController::class, 'removeScreen']);

Route::get('event-sequence', [EventSequenceController::class, 'index']);
Route::post('event-sequence', [EventSequenceController::class, 'store']);
Route::delete('event-sequence/{id}', [EventSequenceController::class, 'destroy']);
Route::post('event-sequence/reorder', [EventSequenceController::class, 'reorder']);
Route::post('event-sequence/{id}/move-up', [EventSequenceController::class, 'moveUp']);
Route::post('event-sequence/{id}/move-down', [EventSequenceController::class, 'moveDown']);

// Judge Occupation Routes (no auth needed - judges use these)
Route::get('occupied-judges', [VotingController::class, 'getOccupiedJudges']);
Route::post('occupy-judge', [VotingController::class, 'occupyJudge']);
Route::post('clear-occupied-judges', [VotingController::class, 'clearOccupiedJudges']);

// Event Templates & Themes (public read, protected write)
Route::get('event-templates', [EventTemplateController::class, 'index']);
Route::get('event-templates/{id}', [EventTemplateController::class, 'show']);
Route::post('event-templates/{id}/create-event', [EventTemplateController::class, 'createFromTemplate']);
Route::get('event-themes', [EventThemeController::class, 'index']);
Route::get('event-themes/{id}', [EventThemeController::class, 'show']);

// Activity Logs (for admin to monitor judge activity)
Route::get('activity-logs', [ActivityLogController::class, 'index']);
Route::post('activity-logs', [ActivityLogController::class, 'store']);
Route::get('activity-logs/stats', [ActivityLogController::class, 'getStats']);
Route::delete('activity-logs/clear', [ActivityLogController::class, 'clear']);

// Reports (for printing and auditing)
Route::get('reports/judge-scores', [ReportController::class, 'getJudgeScores']);

// Event Management Routes (no auth needed - admin use these)
Route::post('clear-event-scores', [VotingController::class, 'clearEventScores']);
Route::post('events/save-draft', [EventController::class, 'saveDraft']); // Allow draft saving without auth
Route::post('events/create-full', [EventController::class, 'createFull']); // Allow full event creation without auth
Route::post('events/{id}/update-step', [EventController::class, 'updateStep']); // Allow step updates without auth

// Protected Admin Routes
Route::middleware('auth:sanctum')->group(function () {
    // Events Management
    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{event}', [EventController::class, 'update']);
    Route::delete('events/{event}', [EventController::class, 'destroy']);
    Route::post('events/{id}/complete', [EventController::class, 'complete']);
    Route::post('events/{id}/archive', [EventController::class, 'archive']);
    Route::post('events/{id}/activate', [EventController::class, 'activate']);

    // Templates (global, reusable event templates)
    Route::get('templates', [TemplateController::class, 'index']);
    Route::get('templates/{id}', [TemplateController::class, 'show']);
    Route::post('templates/{id}/apply', [TemplateController::class, 'applyToEvent']);

    // Candidate Templates (global, reusable candidate lists)
    Route::get('candidate-templates', [CandidateTemplateController::class, 'index']);
    Route::get('candidate-templates/{id}', [CandidateTemplateController::class, 'show']);
    
    // Protected CRUD operations (POST, PUT, DELETE only - GET is public)
    Route::post('candidates', [CandidateController::class, 'store']);
    Route::put('candidates/{candidate}', [CandidateController::class, 'update']);
    Route::delete('candidates/{candidate}', [CandidateController::class, 'destroy']);
    
    Route::post('rounds', [RoundController::class, 'store']);
    Route::put('rounds/{round}', [RoundController::class, 'update']);
    Route::delete('rounds/{round}', [RoundController::class, 'destroy']);
    
    Route::post('criteria', [CriteriaController::class, 'store']);
    Route::put('criteria/{criteria}', [CriteriaController::class, 'update']);
    Route::delete('criteria/{criteria}', [CriteriaController::class, 'destroy']);
    
    // Points: POST is public (judges), PUT/DELETE are protected (admin)
    Route::put('points/{point}', [PointController::class, 'update']);
    Route::delete('points/{point}', [PointController::class, 'destroy']);
});

// Setup & Debug Routes (Admin Only)
Route::prefix('setup')->middleware('auth:sanctum')->group(function () {
    // Debug template data
    Route::get('templates', function() {
        $template = \App\Models\EventTemplate::with(['categories.criteria'])->first();
        return response()->json([
            'template' => $template,
            'categories_count' => $template ? $template->categories->count() : 0,
            'raw_categories' => \DB::table('template_categories')->where('template_id', $template->id ?? 0)->get()
        ]);
    });
    
    // Clear template data
    Route::delete('clear-templates', function() {
        try {
            \DB::table('template_criteria')->delete();
            \DB::table('template_categories')->delete();
            \DB::table('event_templates')->delete();
            
            return response()->json([
                'message' => 'All template data cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error clearing templates',
                'error' => $e->getMessage()
            ], 500);
        }
    });
});

