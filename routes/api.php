<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\StudyArenaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// Study Arenas
Route::get('/study-arenas', [StudyArenaController::class, 'index']);
Route::post('/study-arenas', [StudyArenaController::class, 'store']);
