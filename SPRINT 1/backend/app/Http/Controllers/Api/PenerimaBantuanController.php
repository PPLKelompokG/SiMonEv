<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use Illuminate\Http\Request;

class PenerimaBantuanController extends Controller
{
    public function index()
    {
        $data = PenerimaBantuan::with(['creator', 'verifier'])->latest()->get();

        return response()->json([
            'message' => 'Data penerima berhasil diambil',
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => ['required', 'digits:16', 'unique:penerima_bantuans,nik'],
            'nama' => ['required', 'string', 'max:255'],
            'alamat' => ['required', 'string'],
            'wilayah' => ['nullable', 'string', 'max:255'],
            'kondisi_ekonomi' => ['required', 'string', 'max:255'],
            'jumlah_tanggungan' => ['required', 'integer', 'min:0'],
            'foto_ktp' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto_ktp')) {
            $fotoPath = $request->file('foto_ktp')->store('ktp', 'public');
        }

        $penerima = PenerimaBantuan::create([
            'nik' => $validated['nik'],
            'nama' => $validated['nama'],
            'alamat' => $validated['alamat'],
            'wilayah' => $validated['wilayah'] ?? null,
            'kondisi_ekonomi' => $validated['kondisi_ekonomi'],
            'jumlah_tanggungan' => $validated['jumlah_tanggungan'],
            'foto_ktp' => $fotoPath,
            'status' => 'diajukan',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Penerima bantuan berhasil didaftarkan',
            'data' => $penerima,
        ], 201);
    }
}