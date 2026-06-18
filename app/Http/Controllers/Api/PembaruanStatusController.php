<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use App\Models\HistoriStatusPenerima;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PembaruanStatusController extends Controller
{
    // Mengambil daftar penerima yang sudah disetujui (untuk diupdate statusnya)
    public function getEligiblePenerima()
    {
        $data = PenerimaBantuan::where('status', 'disetujui')
                ->select('id', 'nik', 'nama', 'status_penerima', 'alamat')
                ->get();
        
        return response()->json([
            'message' => 'Berhasil mengambil data penerima',
            'data' => $data
        ]);
    }

    // Mengambil semua histori perubahan status
    public function history()
    {
        $histori = HistoriStatusPenerima::with(['penerimaBantuan', 'petugas'])
                    ->latest()
                    ->get();
        
        return response()->json([
            'message' => 'Berhasil mengambil histori',
            'data' => $histori
        ]);
    }

    // Menyimpan perubahan status
    public function store(Request $request)
    {
        if (!in_array(auth()->user()->role, ['admin', 'supervisor'])) {
            return response()->json([
                'message' => 'Akses ditolak: Hanya Admin dan Supervisor yang dapat mengubah status graduasi.'
            ], 403);
        }

        $validated = $request->validate([
            'penerima_bantuan_id' => 'required|exists:penerima_bantuans,id',
            'status_baru' => 'required|in:aktif,nonaktif,graduasi',
            'alasan_perubahan' => 'required|string|max:1000',
            'dokumen_pendukung' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        $penerima = PenerimaBantuan::findOrFail($validated['penerima_bantuan_id']);

        if ($penerima->status_penerima === $validated['status_baru']) {
            return response()->json([
                'message' => 'Status baru tidak boleh sama dengan status saat ini (' . $penerima->status_penerima . ')'
            ], 422);
        }

        $path = null;
        if ($request->hasFile('dokumen_pendukung')) {
            $path = $request->file('dokumen_pendukung')->store('dokumen_status', 'public');
        }

        // Simpan histori
        $histori = HistoriStatusPenerima::create([
            'penerima_bantuan_id' => $penerima->id,
            'status_lama' => $penerima->status_penerima,
            'status_baru' => $validated['status_baru'],
            'alasan_perubahan' => $validated['alasan_perubahan'],
            'dokumen_pendukung' => $path,
            'changed_by' => auth()->id()
        ]);

        // Update status di penerima
        $penerima->update([
            'status_penerima' => $validated['status_baru']
        ]);

        return response()->json([
            'message' => 'Status penerima berhasil diperbarui',
            'data' => $histori->load(['penerimaBantuan', 'petugas'])
        ], 201);
    }
}
