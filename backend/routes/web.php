<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

// Broadcasting auth endpoint for private channels - NO middleware to avoid CSRF
Route::post('/broadcasting/auth', function () {
    $response = response(Broadcast::auth(), 200);
    $response->header('Access-Control-Allow-Origin', 'http://localhost:5173');
    $response->header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    $response->header('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-TOKEN');
    $response->header('Access-Control-Allow-Credentials', 'true');
    return $response;
})->withoutMiddleware(['web', 'csrf']);

// Handle CORS preflight requests
Route::options('/broadcasting/auth', function () {
    $response = response('', 200);
    $response->header('Access-Control-Allow-Origin', 'http://localhost:5173');
    $response->header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    $response->header('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-TOKEN');
    $response->header('Access-Control-Allow-Credentials', 'true');
    return $response;
})->withoutMiddleware(['web', 'csrf']);

Route::get('/', function () {
    return view('welcome');
});

Route::get('/flowcharts', function () {
    return view('flowcharts.index');
})->name('flowcharts');

Route::get('/erd', function () {
    return view('erd.index');
})->name('erd');
