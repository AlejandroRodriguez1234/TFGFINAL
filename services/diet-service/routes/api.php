<?php

use App\Http\Controllers\FoodController;
use App\Http\Controllers\MealLogController;
use App\Http\Controllers\DietPlanController;
use App\Http\Controllers\BarcodeController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\HydrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FitForge Diet Service API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth.jwt')->group(function () {

    // ── Food Database ─────────────────────────────────────────────────────
    Route::prefix('foods')->group(function () {
        Route::get('/',         [FoodController::class, 'index']);
        Route::get('/search',   [FoodController::class, 'search']);
        Route::get('/{id}',     [FoodController::class, 'show']);
        Route::post('/',        [FoodController::class, 'store']);
        Route::get('/barcode/{barcode}', [BarcodeController::class, 'lookup']);
    });

    // ── Meal Logs ─────────────────────────────────────────────────────────
    Route::prefix('meals')->group(function () {
        Route::get('/',          [MealLogController::class, 'index']);
        Route::get('/today',     [MealLogController::class, 'today']);
        Route::post('/',         [MealLogController::class, 'store']);
        Route::put('/{id}',      [MealLogController::class, 'update']);
        Route::delete('/{id}',   [MealLogController::class, 'destroy']);
        Route::get('/macros',    [MealLogController::class, 'macrosSummary']);
    });

    // ── Diet Plans ────────────────────────────────────────────────────────
    Route::prefix('plans')->group(function () {
        Route::get('/',         [DietPlanController::class, 'index']);
        Route::get('/active',   [DietPlanController::class, 'active']);
        Route::post('/',        [DietPlanController::class, 'store']);
        Route::post('/generate',[DietPlanController::class, 'generate']); // AI-powered
        Route::put('/{id}',     [DietPlanController::class, 'update']);
        Route::delete('/{id}',  [DietPlanController::class, 'destroy']);
        Route::post('/{id}/activate', [DietPlanController::class, 'activate']);
    });

    // ── Hydration ─────────────────────────────────────────────────────────
    Route::prefix('hydration')->group(function () {
        Route::get('/today',  [HydrationController::class, 'today']);
        Route::post('/log',   [HydrationController::class, 'log']);
        Route::get('/history',[HydrationController::class, 'history']);
    });

    // ── Chatbot ───────────────────────────────────────────────────────────
    Route::post('/chatbot', [ChatbotController::class, 'ask']);
});
