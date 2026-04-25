<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FamilyMemberController;

Route::resource('family', FamilyMemberController::class);
Route::get('/', function () {
    return view('welcome');
});
