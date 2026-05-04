<?php

namespace App\Http\Controllers;

use App\Models\ProgramBantuan;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Controller ini bertanggung jawab untuk menangani PBI-06 (Laporan & Ekspor Data Program).
     */
    public function index(Request $request)
    {
        $query = ProgramBantuan::query();

        // Filter berdasarkan tanggal mulai (menggunakan created_at)
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        // Filter berdasarkan tanggal selesai (menggunakan created_at)
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Filter berdasarkan wilayah
        // CATATAN: Model ProgramBantuan saat ini belum memiliki kolom 'wilayah'.
        // Jika parameter wilayah dikirim, kita dapat mengabaikannya untuk menghindari SQL Error,
        // atau Anda bisa menambahkannya di migration ProgramBantuan di masa mendatang.
        /*
        if ($request->filled('wilayah')) {
            $query->where('wilayah', $request->wilayah);
        }
        */

        // Format data sesuai dengan struktur tabel di frontend
        $reports = $query->latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_program' => $item->nama_program,
                'tanggal' => $item->created_at->format('Y-m-d'),
                'wilayah' => 'Semua Wilayah', // Placeholder karena tidak ada kolom wilayah
                'status' => $item->status ? 'Aktif' : 'Nonaktif',
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
