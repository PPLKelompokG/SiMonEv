<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenyaluranBantuan;
use App\Models\PenerimaBantuan;
use App\Models\ProgramBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenyaluranBantuanController extends Controller
{
    public function index()
    {
        $data = PenyaluranBantuan::with(['penerimaBantuan', 'programBantuan', 'petugasPenyalur'])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Data riwayat penyaluran berhasil diambil',
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'penerima_bantuan_id' => 'required|exists:penerima_bantuans,id',
            'program_bantuan_id' => 'nullable|exists:program_bantuans,id',
            'tanggal_penyaluran' => 'required|date',
            'jenis_bantuan' => 'required|string|max:255',
            'jumlah_bantuan' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        // Pastikan penerima statusnya disetujui
        $penerima = PenerimaBantuan::find($validated['penerima_bantuan_id']);
        if ($penerima->status !== 'disetujui') {
            return response()->json([
                'message' => 'Penerima bantuan belum disetujui / tidak aktif',
            ], 422);
        }

        $penyaluran = PenyaluranBantuan::create([
            'penerima_bantuan_id' => $validated['penerima_bantuan_id'],
            'program_bantuan_id' => $validated['program_bantuan_id'],
            'tanggal_penyaluran' => $validated['tanggal_penyaluran'],
            'jenis_bantuan' => $validated['jenis_bantuan'],
            'jumlah_bantuan' => $validated['jumlah_bantuan'],
            'keterangan' => $validated['keterangan'] ?? null,
            'petugas_penyalur_id' => auth()->id(),
            'status_laporan' => 'dalam antrian',
        ]);

        return response()->json([
            'message' => 'Penyaluran bantuan berhasil dicatat',
            'data' => $penyaluran,
        ], 201);
    }

    public function show($id)
    {
        $penyaluran = PenyaluranBantuan::with(['penerimaBantuan', 'programBantuan', 'petugasPenyalur'])->find($id);

        if (!$penyaluran) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail penyaluran',
            'data' => $penyaluran,
        ]);
    }

    public function getApprovedPenerima()
    {
        // Hanya yang status disetujui
        $penerima = PenerimaBantuan::where('status', 'disetujui')
            ->select('id', 'nik', 'nama', 'alamat')
            ->get();

        return response()->json([
            'message' => 'Data penerima yang disetujui',
            'data' => $penerima,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status_laporan' => 'required|in:dalam antrian,sedang diproses,sudah diproses',
        ]);

        $penyaluran = PenyaluranBantuan::find($id);

        if (!$penyaluran) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $penyaluran->update([
            'status_laporan' => $validated['status_laporan']
        ]);

        return response()->json([
            'message' => 'Status penyaluran berhasil diperbarui',
            'data' => $penyaluran
        ]);
    }
}
