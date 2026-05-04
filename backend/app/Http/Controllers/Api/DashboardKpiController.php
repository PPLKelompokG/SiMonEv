<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use App\Models\PenyaluranBantuan;
use App\Models\ProgramBantuan;
use App\Models\HistoriStatusPenerima;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardKpiController extends Controller
{
    /**
     * KPI Kemiskinan — Statistik utama dashboard.
     * GET /api/dashboard-kpi/stats
     */
    public function stats(): JsonResponse
    {
        // Total penerima bantuan
        $totalPenerima = PenerimaBantuan::count();

        // Status counts
        $penerimaDisetujui = PenerimaBantuan::where('status', 'disetujui')->count();
        $penerimaDiajukan  = PenerimaBantuan::where('status', 'diajukan')->count();
        $penerimaDitolak   = PenerimaBantuan::where('status', 'ditolak')->count();

        // Graduasi (status_penerima = 'graduasi')
        $penerimaGraduasi = PenerimaBantuan::where('status_penerima', 'graduasi')->count();

        // Status penerima breakdown (aktif, nonaktif, graduasi)
        $penerimaAktif    = PenerimaBantuan::where('status_penerima', 'aktif')->count();
        $penerimaNonaktif = PenerimaBantuan::where('status_penerima', 'nonaktif')->count();

        // Total dana tersalurkan (dari penyaluran yang sudah approved)
        $totalDanaTersalurkan = PenyaluranBantuan::where('status_approval', 'approved')
            ->sum('jumlah_bantuan');

        // Program aktif
        $programAktif = ProgramBantuan::where('status', true)->count();
        $totalProgram = ProgramBantuan::count();

        // Tingkat keberhasilan program (penerima graduasi / total penerima disetujui)
        $tingkatKeberhasilan = $penerimaDisetujui > 0
            ? round(($penerimaGraduasi / $penerimaDisetujui) * 100, 1)
            : 0;

        // Persentase penyaluran berhasil
        $totalPenyaluran = PenyaluranBantuan::count();
        $penyaluranApproved = PenyaluranBantuan::where('status_approval', 'approved')->count();
        $persentasePenyaluran = $totalPenyaluran > 0
            ? round(($penyaluranApproved / $totalPenyaluran) * 100, 1)
            : 0;

        // Penyaluran per jenis bantuan
        $penyaluranPerJenis = PenyaluranBantuan::select(
                'jenis_bantuan',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(jumlah_bantuan) as total_dana')
            )
            ->groupBy('jenis_bantuan')
            ->get();

        // Total perubahan status bulan ini
        $graduasiBulanIni = HistoriStatusPenerima::where('status_baru', 'graduasi')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_penerima'          => $totalPenerima,
                'penerima_disetujui'      => $penerimaDisetujui,
                'penerima_diajukan'       => $penerimaDiajukan,
                'penerima_ditolak'        => $penerimaDitolak,
                'penerima_graduasi'       => $penerimaGraduasi,
                'penerima_aktif'          => $penerimaAktif,
                'penerima_nonaktif'       => $penerimaNonaktif,
                'total_dana_tersalurkan'  => $totalDanaTersalurkan,
                'program_aktif'           => $programAktif,
                'total_program'           => $totalProgram,
                'tingkat_keberhasilan'    => $tingkatKeberhasilan,
                'persentase_penyaluran'   => $persentasePenyaluran,
                'total_penyaluran'        => $totalPenyaluran,
                'penyaluran_approved'     => $penyaluranApproved,
                'penyaluran_per_jenis'    => $penyaluranPerJenis,
                'graduasi_bulan_ini'      => $graduasiBulanIni,
            ],
        ]);
    }

    /**
     * Trends — Tren penerima bantuan & dana tersalurkan per bulan (12 bulan terakhir).
     * GET /api/dashboard-kpi/trends
     */
    public function trends(): JsonResponse
    {
        // Tren pendaftaran penerima per bulan
        $pendaftaranTrends = PenerimaBantuan::where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bulan"),
                DB::raw('COUNT(*) as total_penerima')
            )
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get();

        // Tren dana tersalurkan per bulan
        $danaTrends = PenyaluranBantuan::where('status_approval', 'approved')
            ->where('tanggal_penyaluran', '>=', now()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(tanggal_penyaluran, '%Y-%m') as bulan"),
                DB::raw('SUM(jumlah_bantuan) as total_dana'),
                DB::raw('COUNT(*) as total_distribusi')
            )
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get();

        // Tren penerima berdasarkan status per bulan
        $statusTrends = PenerimaBantuan::where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bulan"),
                'status',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('bulan', 'status')
            ->orderBy('bulan')
            ->get();

        // Program breakdown by kategori
        $programBreakdown = ProgramBantuan::select('kategori_sdg', DB::raw('COUNT(*) as total'))
            ->groupBy('kategori_sdg')
            ->get();

        // Tren graduasi per bulan (dari histori_status_penerimas)
        $graduasiTrends = HistoriStatusPenerima::where('status_baru', 'graduasi')
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bulan"),
                DB::raw('COUNT(*) as total_graduasi')
            )
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get();

        // Tren penyaluran per jenis bantuan per bulan
        $penyaluranJenisTrends = PenyaluranBantuan::where('tanggal_penyaluran', '>=', now()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(tanggal_penyaluran, '%Y-%m') as bulan"),
                'jenis_bantuan',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(jumlah_bantuan) as total_dana')
            )
            ->groupBy('bulan', 'jenis_bantuan')
            ->orderBy('bulan')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'pendaftaran'          => $pendaftaranTrends,
                'dana'                 => $danaTrends,
                'status_breakdown'     => $statusTrends,
                'program_breakdown'    => $programBreakdown,
                'graduasi'             => $graduasiTrends,
                'penyaluran_per_jenis' => $penyaluranJenisTrends,
            ],
        ]);
    }
}

