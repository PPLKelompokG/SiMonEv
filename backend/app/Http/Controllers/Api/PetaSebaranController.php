<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PetaSebaranController extends Controller
{
    /**
     * Get aggregated data per wilayah for map visualization.
     */
    public function sebaranWilayah(Request $request)
    {
        $query = PenerimaBantuan::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Aggregate per wilayah
        $perWilayah = (clone $query)
            ->select(
                'wilayah',
                DB::raw('COUNT(*) as total_penerima'),
                DB::raw("SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as disetujui"),
                DB::raw("SUM(CASE WHEN status = 'diajukan' THEN 1 ELSE 0 END) as diajukan"),
                DB::raw("SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak"),
                DB::raw("SUM(CASE WHEN kondisi_ekonomi = 'sangat_miskin' THEN 1 ELSE 0 END) as sangat_miskin"),
                DB::raw("SUM(CASE WHEN kondisi_ekonomi = 'miskin' THEN 1 ELSE 0 END) as miskin"),
                DB::raw("SUM(CASE WHEN kondisi_ekonomi = 'rentan_miskin' THEN 1 ELSE 0 END) as rentan_miskin"),
                DB::raw('AVG(jumlah_tanggungan) as rata_tanggungan')
            )
            ->whereNotNull('wilayah')
            ->where('wilayah', '!=', '')
            ->groupBy('wilayah')
            ->orderByDesc('total_penerima')
            ->get();

        // Per kondisi_ekonomi summary
        $perKondisi = (clone $query)
            ->select('kondisi_ekonomi', DB::raw('COUNT(*) as total'))
            ->groupBy('kondisi_ekonomi')
            ->get()
            ->pluck('total', 'kondisi_ekonomi');

        $totalAll = PenerimaBantuan::count();
        $totalWithWilayah = PenerimaBantuan::whereNotNull('wilayah')->where('wilayah', '!=', '')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'per_wilayah'    => $perWilayah,
                'per_kondisi'    => $perKondisi,
                'total'          => $totalAll,
                'total_wilayah'  => $perWilayah->count(),
                'coverage'       => $totalWithWilayah,
            ],
        ]);
    }
}
