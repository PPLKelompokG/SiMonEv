<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PenerimaBantuanController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\VerifikasiPenerimaController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // PBI-05 Manajemen Akun
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::get('/users/{id}', [UserManagementController::class, 'show']);
    Route::put('/users/{id}', [UserManagementController::class, 'update']);

    // PBI-07 Pendaftaran
    Route::get('/penerima-bantuan', [PenerimaBantuanController::class, 'index']);
    Route::post('/penerima-bantuan', [PenerimaBantuanController::class, 'store']);

    // PBI-08 Verifikasi
    Route::get('/verifikasi/pending', [VerifikasiPenerimaController::class, 'pending']);
    Route::put('/verifikasi/{id}', [VerifikasiPenerimaController::class, 'verify']);
});