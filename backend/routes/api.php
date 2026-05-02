<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PenerimaBantuanController;
use App\Http\Controllers\Api\ProgramBantuanController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\VerifikasiPenerimaController;
use App\Http\Controllers\Api\PenyaluranBantuanController;
use App\Http\Controllers\Api\PembaruanStatusController;
use App\Http\Controllers\Api\KiaController;
use App\Http\Controllers\Api\DistribusiPanganController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // PBI-05 Manajemen Akun
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::get('/users/{id}', [UserManagementController::class, 'show']);
    Route::put('/users/{id}', [UserManagementController::class, 'update']);
    Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);

    // PBI-07 Pendaftaran
    Route::get('/penerima-bantuan', [PenerimaBantuanController::class, 'index']);
    Route::post('/penerima-bantuan', [PenerimaBantuanController::class, 'store']);

    // PBI-08 Verifikasi
    Route::get('/verifikasi/pending', [VerifikasiPenerimaController::class, 'pending']);
    Route::put('/verifikasi/{id}', [VerifikasiPenerimaController::class, 'verify']);

    // PBI-02 Program Bantuan
    Route::get('/program-bantuan', [ProgramBantuanController::class, 'index']);
    Route::post('/program-bantuan', [ProgramBantuanController::class, 'store']);
    Route::get('/program-bantuan/{id}', [ProgramBantuanController::class, 'show']);
    Route::put('/program-bantuan/{id}', [ProgramBantuanController::class, 'update']);
    Route::delete('/program-bantuan/{id}', [ProgramBantuanController::class, 'destroy']);

    // PBI-09 Penyaluran Bantuan
    Route::get('/penyaluran-bantuan/penerima-disetujui', [PenyaluranBantuanController::class, 'getApprovedPenerima']);
    Route::get('/penyaluran-bantuan', [PenyaluranBantuanController::class, 'index']);
    Route::post('/penyaluran-bantuan', [PenyaluranBantuanController::class, 'store']);
    Route::get('/penyaluran-bantuan/{id}', [PenyaluranBantuanController::class, 'show']);
    Route::put('/penyaluran-bantuan/{id}/status', [PenyaluranBantuanController::class, 'updateStatus']);

    // PBI-10 Pembaruan Status Penerima Bantuan (Graduasi)
    Route::get('/pembaruan-status/penerima', [PembaruanStatusController::class, 'getEligiblePenerima']);
    Route::get('/pembaruan-status/histori', [PembaruanStatusController::class, 'history']);
    Route::post('/pembaruan-status', [PembaruanStatusController::class, 'store']);

    // PBI-16 Approval Penyaluran Bantuan
    Route::get('/approval/penyaluran', [\App\Http\Controllers\Api\ApprovalPenyaluranController::class, 'index']);
    Route::get('/approval/penyaluran/{id}', [\App\Http\Controllers\Api\ApprovalPenyaluranController::class, 'show']);
    Route::put('/approval/penyaluran/{id}/approve', [\App\Http\Controllers\Api\ApprovalPenyaluranController::class, 'approve']);
    Route::put('/approval/penyaluran/{id}/reject', [\App\Http\Controllers\Api\ApprovalPenyaluranController::class, 'reject']);

    // PBI-13 Pencatatan & Monitoring Status Gizi
    Route::get('/status-gizi', [\App\Http\Controllers\Api\StatusGiziController::class, 'index']);
    Route::get('/status-gizi/statistik', [\App\Http\Controllers\Api\StatusGiziController::class, 'statistik']);
    Route::get('/status-gizi/penerima/{id}', [\App\Http\Controllers\Api\StatusGiziController::class, 'historyPenerima']);
    Route::post('/status-gizi', [\App\Http\Controllers\Api\StatusGiziController::class, 'store']);
    Route::put('/status-gizi/{id}', [\App\Http\Controllers\Api\StatusGiziController::class, 'update']);
    Route::delete('/status-gizi/{id}', [\App\Http\Controllers\Api\StatusGiziController::class, 'destroy']);

    // PBI-14 Monitoring Kesehatan Ibu dan Anak (KIA)
    // Ibu Hamil
    Route::get('/kia/ibu-hamil', [KiaController::class, 'indexIbuHamil']);
    Route::get('/kia/ibu-hamil/statistik', [KiaController::class, 'statistikIbuHamil']);
    Route::get('/kia/ibu-hamil/penerima/{id}', [KiaController::class, 'historyIbuHamil']);
    Route::post('/kia/ibu-hamil', [KiaController::class, 'storeIbuHamil']);
    Route::put('/kia/ibu-hamil/{id}', [KiaController::class, 'updateIbuHamil']);
    Route::delete('/kia/ibu-hamil/{id}', [KiaController::class, 'destroyIbuHamil']);
    // Balita
    Route::get('/kia/balita', [KiaController::class, 'indexBalita']);
    Route::get('/kia/balita/statistik', [KiaController::class, 'statistikBalita']);
    Route::get('/kia/balita/penerima/{id}', [KiaController::class, 'historyBalita']);
    Route::post('/kia/balita', [KiaController::class, 'storeBalita']);
    Route::put('/kia/balita/{id}', [KiaController::class, 'updateBalita']);
    Route::delete('/kia/balita/{id}', [KiaController::class, 'destroyBalita']);

    // PBI-15 Pencatatan Distribusi Bantuan Pangan
    Route::get('/distribusi-pangan/penerima-disetujui', [DistribusiPanganController::class, 'getApprovedPenerima']);
    Route::get('/distribusi-pangan/komoditas', [DistribusiPanganController::class, 'komoditas']);
    Route::get('/distribusi-pangan/statistik', [DistribusiPanganController::class, 'statistik']);
    Route::get('/distribusi-pangan/penerima/{id}', [DistribusiPanganController::class, 'historyPenerima']);
    Route::get('/distribusi-pangan', [DistribusiPanganController::class, 'index']);
    Route::post('/distribusi-pangan', [DistribusiPanganController::class, 'store']);
    Route::get('/distribusi-pangan/{id}', [DistribusiPanganController::class, 'show']);
    Route::put('/distribusi-pangan/{id}', [DistribusiPanganController::class, 'update']);
    Route::delete('/distribusi-pangan/{id}', [DistribusiPanganController::class, 'destroy']);
    // PBI-17 Monitoring Kinerja Petugas Lapangan
    Route::get('/kinerja-petugas', [\App\Http\Controllers\Api\KinerjaController::class, 'getKinerjaData']);
});