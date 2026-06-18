<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\KunjunganRumah;
use Illuminate\Support\Facades\Storage;

class KunjunganRumahController extends Controller
{
    public function index()
    {
        $kunjungan = KunjunganRumah::with('petugas:id,name')->orderBy('tanggal', 'desc')->get();
        return response()->json($kunjungan);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'nama_penerima' => 'required|string|max:255',
            'nik_penerima' => 'nullable|string|max:255',
            'ringkasan_kondisi' => 'required|string|max:255',
            'temuan_detail' => 'nullable|string',
            'rekomendasi' => 'nullable|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except('foto');
        $data['petugas_id'] = auth()->id();

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('kunjungan_rumah', 'public');
            $data['foto'] = $path;
        }

        $kunjungan = KunjunganRumah::create($data);

        return response()->json([
            'message' => 'Laporan kunjungan berhasil disimpan',
            'data' => $kunjungan
        ], 201);
    }
}
