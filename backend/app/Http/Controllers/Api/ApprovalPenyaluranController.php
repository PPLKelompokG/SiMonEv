<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenyaluranBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ApprovalPenyaluranController extends Controller
{
    /**
     * Tampilkan daftar laporan penyaluran.
     */
    public function index()
    {
        // Hanya supervisor yang boleh mengakses, asumsi role 'supervisor' (sudah ditangani middleware jika ada)
        // Jika tidak, kita bisa tambahkan pengecekan manual atau middleware
        if (!in_array(Auth::user()->role, ['supervisor', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only supervisor or admin can access.'
            ], 403);
        }

        $laporans = PenyaluranBantuan::with(['penerimaBantuan', 'programBantuan', 'petugasPenyalur', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $laporans
        ]);
    }

    /**
     * Tampilkan detail laporan penyaluran.
     */
    public function show($id)
    {
        if (!in_array(Auth::user()->role, ['supervisor', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only supervisor or admin can access.'
            ], 403);
        }

        $laporan = PenyaluranBantuan::with(['penerimaBantuan', 'programBantuan', 'petugasPenyalur', 'approvedBy'])->find($id);

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $laporan
        ]);
    }

    /**
     * Setujui laporan penyaluran.
     */
    public function approve($id)
    {
        if (!in_array(Auth::user()->role, ['supervisor', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only supervisor or admin can access.'
            ], 403);
        }

        $laporan = PenyaluranBantuan::find($id);

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan'
            ], 404);
        }

        if ($laporan->status_approval === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Laporan sudah disetujui sebelumnya'
            ], 400);
        }

        $laporan->update([
            'status_approval' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'catatan_koreksi' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil disetujui',
            'data' => $laporan
        ]);
    }

    /**
     * Kembalikan/tolak laporan penyaluran dengan catatan koreksi.
     */
    public function reject(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['supervisor', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only supervisor or admin can access.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'catatan_koreksi' => 'required|string|min:5'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $laporan = PenyaluranBantuan::find($id);

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan'
            ], 404);
        }

        if ($laporan->status_approval === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Laporan sudah disetujui, tidak bisa dikembalikan'
            ], 400);
        }

        $laporan->update([
            'status_approval' => 'returned',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'catatan_koreksi' => $request->catatan_koreksi
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan dikembalikan dengan catatan',
            'data' => $laporan
        ]);
    }
}
