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
    return redirect('/judge');
});

Route::get('/flowcharts', function () {
    return view('flowcharts.index');
})->name('flowcharts');

Route::get('/erd', function () {
    return view('erd.index');
})->name('erd');

// Vue page routes
Route::get('/judge', function () {
    return view('vue');
})->name('judge');

Route::get('/admin', function () {
    return view('vue');
})->name('admin');

Route::get('/setup', function () {
    return view('vue');
})->name('setup');

Route::get('/admin/login', function () {
    return view('vue');
})->name('admin.login');

Route::get('/admin/documentation', function () {
    return view('vue');
})->name('admin.documentation');

Route::get('/admin/certificates', function () {
    return view('vue');
})->name('admin.certificates');

Route::get('/judges/configure', function () {
    return view('vue');
})->name('judges.configure');

Route::get('/create-event', function () {
    return view('vue');
})->name('create-event');
