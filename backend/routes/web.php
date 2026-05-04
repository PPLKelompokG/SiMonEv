<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
use App\Http\Controllers\FamilyMemberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KeluargaController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// HALAMAN AWAL
Route::get('/', function () {
    return view('welcome');
});

Route::resource('family', FamilyMemberController::class);

/*
|--------------------------------------------------------------------------
| AUTH REQUIRED (WAJIB LOGIN)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // DASHBOARD
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // MANAJEMEN KELUARGA (CRUD SEDERHANA)
    Route::prefix('manajemen-keluarga')->group(function () {

        Route::get('/', [KeluargaController::class, 'index'])
            ->name('keluarga.index');

        Route::post('/', [KeluargaController::class, 'store'])
            ->name('keluarga.store');

        Route::delete('/{id}', [KeluargaController::class, 'destroy'])
            ->name('keluarga.destroy');

    });

});

/*
|--------------------------------------------------------------------------
| AUTH ROUTES (LOGIN, REGISTER, dll)
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php';