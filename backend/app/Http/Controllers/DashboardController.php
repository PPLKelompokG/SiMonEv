<?php

namespace App\Http\Controllers;

use App\Models\Keluarga;

class DashboardController extends Controller
{
    public function index()
    {
        $jumlahKeluarga = Keluarga::count();

        return view('dashboard', compact('jumlahKeluarga'));
    }
}