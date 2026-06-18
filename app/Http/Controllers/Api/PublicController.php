<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use App\Models\ProgramBantuan;
use App\Models\PenyaluranBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    /**
     * Get aggregated statistics for the landing page.
     */
    public function landingStats(Request $request)
    {
        // 1. Total Bantuan Tersalurkan (Sum of jumlah_bantuan for approved distributions)
        $totalBantuan = PenyaluranBantuan::where('status_approval', 'approved')
            ->sum('jumlah_bantuan');

        // 2. Jumlah Penerima (Count of all disetujui recipients)
        $jumlahPenerima = PenerimaBantuan::where('status', 'disetujui')->count();

        // 3. Program Bantuan Aktif
        $programAktif = ProgramBantuan::where('status', true)->count();

        // 4. Wilayah Terjangkau (Unique wilayah count)
        $wilayahTerjangkau = PenerimaBantuan::whereNotNull('wilayah')
            ->where('wilayah', '!=', '')
            ->distinct('wilayah')
            ->count('wilayah');

        // 5. Status Penyaluran (Persentase penerima yang sudah mendapatkan bantuan dari total disetujui)
        // Check how many unique recipients have approved aid
        $penerimaSudahDapat = PenyaluranBantuan::where('status_approval', 'approved')
            ->distinct('penerima_bantuan_id')
            ->count('penerima_bantuan_id');

        $statusPenyaluran = 0;
        if ($jumlahPenerima > 0) {
            $statusPenyaluran = round(($penerimaSudahDapat / $jumlahPenerima) * 100);
            // Cap at 100% just in case
            if ($statusPenyaluran > 100) $statusPenyaluran = 100;
        }

        // 6. Peta Sebaran (Aggregated counts per wilayah)
        $sebaranWilayah = PenerimaBantuan::select(
                'wilayah',
                DB::raw('COUNT(*) as total_penerima')
            )
            ->whereNotNull('wilayah')
            ->where('wilayah', '!=', '')
            ->where('status', 'disetujui') // Only show approved on map
            ->groupBy('wilayah')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_bantuan' => $totalBantuan,
                'jumlah_penerima' => $jumlahPenerima,
                'program_aktif' => $programAktif,
                'wilayah_terjangkau' => $wilayahTerjangkau,
                'status_penyaluran' => $statusPenyaluran,
                'sebaran_wilayah' => $sebaranWilayah,
            ]
        ]);
    }
}
