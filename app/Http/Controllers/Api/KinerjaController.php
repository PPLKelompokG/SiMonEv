<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class KinerjaController extends Controller
{
    public function getKinerjaData(Request $request)
    {
        // Parameter filter waktu, default bulan ini
        $startDate = $request->query('start_date', \Carbon\Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', \Carbon\Carbon::now()->endOfMonth()->toDateString());

        // Ambil semua petugas lapangan
        $petugas = \App\Models\User::where('role', 'petugas_lapangan')->get();

        $kinerjaList = [];
        
        $totalKunjunganAll = 0;
        $totalDistribusiAll = 0;
        $totalPendaftaranAll = 0;
        
        // Bobot nilai
        $bobotKunjungan = 10;
        $bobotDistribusi = 20;
        $bobotPendaftaran = 15;

        foreach ($petugas as $p) {
            // Jumlah Kunjungan Rumah
            $jmlKunjungan = \App\Models\KunjunganRumah::where('petugas_id', $p->id)
                ->whereBetween('tanggal', [$startDate, $endDate])
                ->count();
                
            // Jumlah Distribusi Bantuan
            $jmlDistribusi = \App\Models\PenyaluranBantuan::where('petugas_penyalur_id', $p->id)
                ->whereBetween('tanggal_penyaluran', [$startDate, $endDate])
                ->count();
                
            // Jumlah Pendaftaran Baru (Penerima Bantuan yg diajukan/disetujui oleh petugas ini)
            $jmlPendaftaran = \App\Models\PenerimaBantuan::where('created_by', $p->id)
                ->where('status', 'disetujui')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();

            $totalKunjunganAll += $jmlKunjungan;
            $totalDistribusiAll += $jmlDistribusi;
            $totalPendaftaranAll += $jmlPendaftaran;

            // Hitung Poin
            $totalPoin = ($jmlKunjungan * $bobotKunjungan) + ($jmlDistribusi * $bobotDistribusi) + ($jmlPendaftaran * $bobotPendaftaran);

            // Status Kinerja
            $statusKinerja = 'Needs Improvement';
            if ($totalPoin >= 300) {
                $statusKinerja = 'Exceeds Target';
            } elseif ($totalPoin >= 150) {
                $statusKinerja = 'On Track';
            }

            $kinerjaList[] = [
                'petugas_id' => $p->id,
                'nama' => $p->name,
                'kunjungan' => $jmlKunjungan,
                'distribusi' => $jmlDistribusi,
                'pendaftaran' => $jmlPendaftaran,
                'poin' => $totalPoin,
                'status' => $statusKinerja
            ];
        }

        // Urutkan berdasarkan poin tertinggi untuk mendapatkan ranking
        usort($kinerjaList, function($a, $b) {
            return $b['poin'] <=> $a['poin'];
        });
        
        // Tambahkan peringkat
        $peringkat = 1;
        foreach ($kinerjaList as &$k) {
            $k['peringkat'] = $peringkat++;
        }

        // Petugas Terbaik (yang pertama setelah di-sort)
        $petugasTerbaik = count($kinerjaList) > 0 && $kinerjaList[0]['poin'] > 0 ? $kinerjaList[0] : null;

        return response()->json([
            'summary' => [
                'total_kunjungan' => $totalKunjunganAll,
                'total_distribusi' => $totalDistribusiAll,
                'total_pendaftaran_disetujui' => $totalPendaftaranAll,
                'petugas_terbaik' => $petugasTerbaik
            ],
            'chart_data' => array_map(function($k) {
                return [
                    'name' => explode(' ', $k['nama'])[0], // Nama depan saja untuk chart
                    'Kunjungan' => $k['kunjungan'],
                    'Distribusi' => $k['distribusi'],
                    'Pendaftaran' => $k['pendaftaran'],
                ];
            }, $kinerjaList),
            'peringkat_produktivitas' => $kinerjaList
        ]);
    }
}
