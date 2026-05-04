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

        // Format data sesuai dengan struktur tabel di frontend
        $reports = $query->latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_program' => $item->nama_program,
                'tanggal' => $item->created_at->format('Y-m-d'),
                'wilayah' => 'Semua Wilayah',
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
        $query = ProgramBantuan::query();

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $programs = $query->latest()->get();

        $format = $request->query('format');

        if ($format === 'pdf') {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pdf', compact('programs'));
            return $pdf->download('Laporan_SiMonEv_' . date('Y-m-d_H-i-s') . '.pdf');
        }

        $filename = "Laporan_SiMonEv_" . date('Y-m-d_H-i-s') . ".csv";
        
        return response()->streamDownload(function () use ($programs) {
            $output = fopen('php://output', 'w');
            
            // Add BOM for proper UTF-8 Excel rendering
            fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($output, ['No', 'Nama Program', 'Kategori SDG', 'Anggaran (Rp)', 'Periode', 'Status', 'Tanggal Ditambahkan']);

            foreach ($programs as $index => $program) {
                fputcsv($output, [
                    $index + 1,
                    $program->nama_program,
                    $program->kategori_sdg,
                    $program->anggaran,
                    $program->periode,
                    $program->status ? 'Aktif' : 'Nonaktif',
                    $program->created_at->format('Y-m-d')
                ]);
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }
}
