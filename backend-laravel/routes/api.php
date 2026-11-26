<?php

use App\Http\Controllers\Api\AdminSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FinanceController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [FinanceController::class, 'health']);

// Admin Dashboard Configuration (OAuth Links, Gemini AI API Key/Model, App Settings & Stats)
Route::get('/admin/settings', [AdminSettingController::class, 'index']);
Route::put('/admin/settings', [AdminSettingController::class, 'update']);
Route::post('/admin/settings/test-ai', [AdminSettingController::class, 'testGeminiConnection']);

// Auth & Account Profile (Register, Email Login, Google OAuth, Update Profile, Change Password)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleCallback']);
Route::get('/auth/google/callback', [AuthController::class, 'googleBackendCallback']);
Route::post('/auth/google/exchange', [AuthController::class, 'googleCodeExchange']);
Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
Route::put('/auth/password', [AuthController::class, 'updatePassword']);

// Finance Endpoints (Full CRUD with MySQL Persistence)
Route::get('/dashboard', [FinanceController::class, 'dashboard']);

Route::post('/wallets', [FinanceController::class, 'storeWallet']);
Route::put('/wallets/{wallet}', [FinanceController::class, 'updateWallet']);
Route::delete('/wallets/{wallet}', [FinanceController::class, 'destroyWallet']);

Route::post('/categories', [FinanceController::class, 'storeCategory']);
Route::put('/categories/{category}', [FinanceController::class, 'updateCategory']);
Route::delete('/categories/{category}', [FinanceController::class, 'destroyCategory']);

Route::post('/transactions', [FinanceController::class, 'storeTransaction']);
Route::delete('/transactions/{transaction}', [FinanceController::class, 'destroyTransaction']);

Route::post('/budgets', [FinanceController::class, 'upsertBudget']);

// AI OCR Receipt Scanner powered by Google Gemini Vision
Route::post('/receipts/scan', [FinanceController::class, 'scanReceipt']);
