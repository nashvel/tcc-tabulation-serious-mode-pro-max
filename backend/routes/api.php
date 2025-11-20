<?php

use App\Http\Controllers\API\CandidateController;
use App\Http\Controllers\API\RoundController;
use App\Http\Controllers\API\CriteriaController;
use App\Http\Controllers\API\PointController;
use App\Http\Controllers\API\TemplateController;
use App\Http\Controllers\API\CandidateTemplateController;
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

// Public Data Routes (no auth needed)
Route::get('candidates', [CandidateController::class, 'index']);
Route::get('rounds', [RoundController::class, 'index']);
Route::get('criteria', [CriteriaController::class, 'index']);
Route::get('points', [PointController::class, 'index']);
Route::get('scoreboard', [PointController::class, 'getScoreboard']);

// Public Voting & Event Sequence Routes (no auth needed)
Route::get('voting/state', [VotingController::class, 'getState']);
Route::get('voting/history', [VotingController::class, 'getHistory']);
Route::post('voting/start-first-round', [VotingController::class, 'startFirstRound']);
Route::post('voting/activate-round', [VotingController::class, 'activateRound']);
Route::post('voting/lock', [VotingController::class, 'lock']);
Route::post('voting/unlock', [VotingController::class, 'unlock']);

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

// Event Management Routes (no auth needed - admin use these)
Route::post('clear-event-scores', [VotingController::class, 'clearEventScores']);

// Protected Admin Routes
Route::middleware('auth:sanctum')->group(function () {
    // Events Management
    Route::post('events/save-draft', [EventController::class, 'saveDraft']);
    Route::post('events/{id}/update-step', [EventController::class, 'updateStep']);
    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{event}', [EventController::class, 'update']);
    Route::delete('events/{event}', [EventController::class, 'destroy']);
    Route::post('events/{id}/complete', [EventController::class, 'complete']);
    Route::post('events/{id}/archive', [EventController::class, 'archive']);

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
    
    Route::post('points', [PointController::class, 'store']);
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

