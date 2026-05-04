<?php

namespace App\Http\Controllers;

use App\Models\PenerimaBantuan;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Controller ini bertanggung jawab untuk menangani PBI-06 (Laporan & Ekspor Data Program).
     */
    public function index(Request $request)
    {
        $query = PenerimaBantuan::query();

        // Filter berdasarkan tanggal mulai
        if ($request->filled('tanggal_mulai')) {
            $query->whereDate('created_at', '>=', $request->tanggal_mulai);
        }

        // Filter berdasarkan tanggal selesai
        if ($request->filled('tanggal_selesai')) {
            $query->whereDate('created_at', '<=', $request->tanggal_selesai);
        }

        // Filter berdasarkan wilayah
        if ($request->filled('wilayah')) {
            $query->where('wilayah', $request->wilayah);
        }

        // Format data sesuai dengan struktur tabel di frontend
        $reports = $query->latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_program' => 'Bantuan Sosial - ' . $item->nama,
                'tanggal' => $item->created_at->format('Y-m-d'),
                'wilayah' => $item->wilayah ?? '-',
                'status' => ucfirst($item->status),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Data Laporan berhasil diambil',
            'data'    => $reports
        ], 200);
    }

    public function export(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Fungsi export belum diimplementasikan'
        ], 200);
    }
}
