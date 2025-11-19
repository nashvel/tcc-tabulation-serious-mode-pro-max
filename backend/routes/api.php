<?php

use App\Http\Controllers\API\CandidateController;
use App\Http\Controllers\API\RoundController;
use App\Http\Controllers\API\CriteriaController;
use App\Http\Controllers\API\PointController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\VotingController;
use App\Http\Controllers\EventSequenceController;
use Illuminate\Support\Facades\Route;

// Admin Authentication
Route::post('admin/login', [AdminAuthController::class, 'login']);
Route::post('admin/change-pin', [AdminAuthController::class, 'changePin']);

// Events Management
Route::apiResource('events', EventController::class);
Route::post('events/{id}/complete', [EventController::class, 'complete']);
Route::post('events/{id}/archive', [EventController::class, 'archive']);

// Existing routes
Route::apiResource('candidates', CandidateController::class);
Route::apiResource('rounds', RoundController::class);
Route::apiResource('criteria', CriteriaController::class);
Route::apiResource('points', PointController::class);

Route::get('scoreboard', [PointController::class, 'getScoreboard']);

// Voting Control Routes
Route::prefix('voting')->group(function () {
    Route::get('state', [VotingController::class, 'getState']);
    Route::post('start', [VotingController::class, 'start']);
    Route::post('stop', [VotingController::class, 'stop']);
    Route::post('activate-round', [VotingController::class, 'activateRound']);
    Route::post('lock', [VotingController::class, 'lock']);
    Route::post('unlock', [VotingController::class, 'unlock']);
    Route::get('history', [VotingController::class, 'getHistory']);
});

// Event Sequence Routes
Route::prefix('event-sequence')->group(function () {
    Route::get('/', [EventSequenceController::class, 'index']);
    Route::post('/', [EventSequenceController::class, 'store']);
    Route::delete('/{id}', [EventSequenceController::class, 'destroy']);
    Route::post('/reorder', [EventSequenceController::class, 'reorder']);
    Route::post('/{id}/move-up', [EventSequenceController::class, 'moveUp']);
    Route::post('/{id}/move-down', [EventSequenceController::class, 'moveDown']);
});
