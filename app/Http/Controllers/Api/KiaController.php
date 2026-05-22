<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KesehatanIbuHamil;
use App\Models\KesehatanBalita;
use App\Models\PenerimaBantuan;
use Illuminate\Http\Request;

class KiaController extends Controller
{
    // ─────────────────────────────────────────────
    //  IBU HAMIL
    // ─────────────────────────────────────────────

    /** Daftar semua kunjungan ibu hamil */
    public function indexIbuHamil()
    {
        $data = KesehatanIbuHamil::with([
            'penerimaBantuan:id,nik,nama,alamat',
            'petugas:id,name',
        ])->latest('tanggal_kunjungan')->get();

        return response()->json([
            'message' => 'Berhasil mengambil data kesehatan ibu hamil',
            'data'    => $data,
        ]);
    }

    /** Statistik ringkasan ibu hamil */
    public function statistikIbuHamil()
    {
        $total          = KesehatanIbuHamil::count();
        $perKondisi     = KesehatanIbuHamil::selectRaw('kondisi_kehamilan, COUNT(*) as jumlah')
            ->groupBy('kondisi_kehamilan')
            ->pluck('jumlah', 'kondisi_kehamilan');
        $perKunjungan   = KesehatanIbuHamil::selectRaw('status_kunjungan, COUNT(*) as jumlah')
            ->groupBy('status_kunjungan')
            ->pluck('jumlah', 'status_kunjungan');
        $sudahFe        = KesehatanIbuHamil::where('sudah_fe', true)->count();
        $sudahTt        = KesehatanIbuHamil::where('sudah_tt', true)->count();

        return response()->json([
            'message' => 'Statistik kesehatan ibu hamil',
            'data'    => [
                'total'           => $total,
                'per_kondisi'     => $perKondisi,
                'per_kunjungan'   => $perKunjungan,
                'sudah_fe'        => $sudahFe,
                'sudah_tt'        => $sudahTt,
            ],
        ]);
    }

    /** Histori kunjungan per penerima (ibu hamil) */
    public function historyIbuHamil($id)
    {
        $penerima = PenerimaBantuan::findOrFail($id);
        $data     = KesehatanIbuHamil::where('penerima_bantuan_id', $id)
            ->orderBy('tanggal_kunjungan', 'asc')
            ->get();

        return response()->json([
            'message'  => 'Histori kunjungan ibu hamil',
            'penerima' => ['id' => $penerima->id, 'nik' => $penerima->nik, 'nama' => $penerima->nama],
            'data'     => $data,
        ]);
    }

    /** Catat kunjungan ibu hamil baru */
    public function storeIbuHamil(Request $request)
    {
        $validated = $request->validate([
            'penerima_bantuan_id'      => 'required|exists:penerima_bantuans,id',
            'tanggal_kunjungan'        => 'required|date',
            'usia_kehamilan'           => 'required|integer|min:1|max:42',
            'berat_badan'              => 'required|numeric|min:20|max:200',
            'tekanan_darah_sistolik'   => 'nullable|numeric|min:50|max:250',
            'tekanan_darah_diastolik'  => 'nullable|numeric|min:30|max:180',
            'status_kunjungan'         => 'required|in:K1,K2,K3,K4',
            'sudah_fe'                 => 'boolean',
            'sudah_tt'                 => 'boolean',
            'catatan'                  => 'nullable|string|max:2000',
        ]);

        $kondisi = KesehatanIbuHamil::tentukanKondisi(
            $validated['tekanan_darah_sistolik'] ?? null,
            $validated['tekanan_darah_diastolik'] ?? null
        );

        $record = KesehatanIbuHamil::create([
            ...$validated,
            'kondisi_kehamilan' => $kondisi,
            'sudah_fe'          => $validated['sudah_fe'] ?? false,
            'sudah_tt'          => $validated['sudah_tt'] ?? false,
            'recorded_by'       => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Data kunjungan ibu hamil berhasil dicatat',
            'data'    => $record->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name']),
        ], 201);
    }

    /** Update kunjungan ibu hamil */
    public function updateIbuHamil(Request $request, $id)
    {
        $record = KesehatanIbuHamil::findOrFail($id);

        $validated = $request->validate([
            'penerima_bantuan_id'      => 'required|exists:penerima_bantuans,id',
            'tanggal_kunjungan'        => 'required|date',
            'usia_kehamilan'           => 'required|integer|min:1|max:42',
            'berat_badan'              => 'required|numeric|min:20|max:200',
            'tekanan_darah_sistolik'   => 'nullable|numeric|min:50|max:250',
            'tekanan_darah_diastolik'  => 'nullable|numeric|min:30|max:180',
            'status_kunjungan'         => 'required|in:K1,K2,K3,K4',
            'sudah_fe'                 => 'boolean',
            'sudah_tt'                 => 'boolean',
            'catatan'                  => 'nullable|string|max:2000',
        ]);

        $kondisi = KesehatanIbuHamil::tentukanKondisi(
            $validated['tekanan_darah_sistolik'] ?? null,
            $validated['tekanan_darah_diastolik'] ?? null
        );

        $record->update([...$validated, 'kondisi_kehamilan' => $kondisi]);

        return response()->json([
            'message' => 'Data kunjungan ibu hamil berhasil diperbarui',
            'data'    => $record->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name']),
        ]);
    }

    /** Hapus kunjungan ibu hamil */
    public function destroyIbuHamil($id)
    {
        $record = KesehatanIbuHamil::findOrFail($id);
        $record->delete();

        return response()->json(['message' => 'Data kunjungan ibu hamil berhasil dihapus']);
    }

    // ─────────────────────────────────────────────
    //  BALITA
    // ─────────────────────────────────────────────

    /** Daftar semua kunjungan balita */
    public function indexBalita()
    {
        $data = KesehatanBalita::with([
            'penerimaBantuan:id,nik,nama,alamat',
            'petugas:id,name',
        ])->latest('tanggal_kunjungan')->get();

        return response()->json([
            'message' => 'Berhasil mengambil data kesehatan balita',
            'data'    => $data,
        ]);
    }

    /** Statistik ringkasan balita */
    public function statistikBalita()
    {
        $total        = KesehatanBalita::count();
        $perGizi      = KesehatanBalita::selectRaw('status_gizi_balita, COUNT(*) as jumlah')
            ->groupBy('status_gizi_balita')
            ->pluck('jumlah', 'status_gizi_balita');
        $sudahVitA    = KesehatanBalita::where('dapat_vit_a', true)->count();
        $imunLengkap  = KesehatanBalita::where('imunisasi_hb0', true)
            ->where('imunisasi_bcg', true)
            ->where('imunisasi_dpt_hb_hib_1', true)
            ->where('imunisasi_dpt_hb_hib_2', true)
            ->where('imunisasi_dpt_hb_hib_3', true)
            ->where('imunisasi_polio_1', true)
            ->where('imunisasi_polio_2', true)
            ->where('imunisasi_polio_3', true)
            ->where('imunisasi_polio_4', true)
            ->where('imunisasi_campak', true)
            ->where('imunisasi_mr', true)
            ->count();

        return response()->json([
            'message' => 'Statistik kesehatan balita',
            'data'    => [
                'total'               => $total,
                'per_gizi'            => $perGizi,
                'sudah_vit_a'         => $sudahVitA,
                'imunisasi_lengkap'   => $imunLengkap,
            ],
        ]);
    }

    /** Histori kunjungan per penerima (balita) */
    public function historyBalita($id)
    {
        $penerima = PenerimaBantuan::findOrFail($id);
        $data     = KesehatanBalita::where('penerima_bantuan_id', $id)
            ->orderBy('tanggal_kunjungan', 'asc')
            ->get();

        return response()->json([
            'message'  => 'Histori kunjungan balita',
            'penerima' => ['id' => $penerima->id, 'nik' => $penerima->nik, 'nama' => $penerima->nama],
            'data'     => $data,
        ]);
    }

    /** Catat kunjungan balita baru */
    public function storeBalita(Request $request)
    {
        $validated = $request->validate([
            'penerima_bantuan_id'      => 'required|exists:penerima_bantuans,id',
            'nama_balita'              => 'required|string|max:255',
            'tanggal_lahir'            => 'required|date',
            'jenis_kelamin'            => 'required|in:laki_laki,perempuan',
            'tanggal_kunjungan'        => 'required|date',
            'usia_bulan'               => 'required|integer|min:0|max:59',
            'berat_badan'              => 'required|numeric|min:0.5|max:50',
            'tinggi_badan'             => 'nullable|numeric|min:30|max:130',
            'lingkar_kepala'           => 'nullable|numeric|min:20|max:60',
            'imunisasi_hb0'            => 'boolean',
            'imunisasi_bcg'            => 'boolean',
            'imunisasi_dpt_hb_hib_1'  => 'boolean',
            'imunisasi_dpt_hb_hib_2'  => 'boolean',
            'imunisasi_dpt_hb_hib_3'  => 'boolean',
            'imunisasi_polio_1'        => 'boolean',
            'imunisasi_polio_2'        => 'boolean',
            'imunisasi_polio_3'        => 'boolean',
            'imunisasi_polio_4'        => 'boolean',
            'imunisasi_campak'         => 'boolean',
            'imunisasi_mr'             => 'boolean',
            'dapat_vit_a'              => 'boolean',
            'catatan'                  => 'nullable|string|max:2000',
        ]);

        $statusGizi = KesehatanBalita::tentukanStatusGizi(
            $validated['berat_badan'],
            $validated['usia_bulan'],
            $validated['jenis_kelamin']
        );

        $boolFields = [
            'imunisasi_hb0', 'imunisasi_bcg', 'imunisasi_dpt_hb_hib_1',
            'imunisasi_dpt_hb_hib_2', 'imunisasi_dpt_hb_hib_3',
            'imunisasi_polio_1', 'imunisasi_polio_2', 'imunisasi_polio_3',
            'imunisasi_polio_4', 'imunisasi_campak', 'imunisasi_mr', 'dapat_vit_a',
        ];
        foreach ($boolFields as $field) {
            $validated[$field] = $validated[$field] ?? false;
        }

        $record = KesehatanBalita::create([
            ...$validated,
            'status_gizi_balita' => $statusGizi,
            'recorded_by'        => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Data kunjungan balita berhasil dicatat',
            'data'    => $record->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name']),
        ], 201);
    }

    /** Update kunjungan balita */
    public function updateBalita(Request $request, $id)
    {
        $record = KesehatanBalita::findOrFail($id);

        $validated = $request->validate([
            'penerima_bantuan_id'      => 'required|exists:penerima_bantuans,id',
            'nama_balita'              => 'required|string|max:255',
            'tanggal_lahir'            => 'required|date',
            'jenis_kelamin'            => 'required|in:laki_laki,perempuan',
            'tanggal_kunjungan'        => 'required|date',
            'usia_bulan'               => 'required|integer|min:0|max:59',
            'berat_badan'              => 'required|numeric|min:0.5|max:50',
            'tinggi_badan'             => 'nullable|numeric|min:30|max:130',
            'lingkar_kepala'           => 'nullable|numeric|min:20|max:60',
            'imunisasi_hb0'            => 'boolean',
            'imunisasi_bcg'            => 'boolean',
            'imunisasi_dpt_hb_hib_1'  => 'boolean',
            'imunisasi_dpt_hb_hib_2'  => 'boolean',
            'imunisasi_dpt_hb_hib_3'  => 'boolean',
            'imunisasi_polio_1'        => 'boolean',
            'imunisasi_polio_2'        => 'boolean',
            'imunisasi_polio_3'        => 'boolean',
            'imunisasi_polio_4'        => 'boolean',
            'imunisasi_campak'         => 'boolean',
            'imunisasi_mr'             => 'boolean',
            'dapat_vit_a'              => 'boolean',
            'catatan'                  => 'nullable|string|max:2000',
        ]);

        $statusGizi = KesehatanBalita::tentukanStatusGizi(
            $validated['berat_badan'],
            $validated['usia_bulan'],
            $validated['jenis_kelamin']
        );

        $record->update([...$validated, 'status_gizi_balita' => $statusGizi]);

        return response()->json([
            'message' => 'Data kunjungan balita berhasil diperbarui',
            'data'    => $record->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name']),
        ]);
    }

    /** Hapus kunjungan balita */
    public function destroyBalita($id)
    {
        $record = KesehatanBalita::findOrFail($id);
        $record->delete();

        return response()->json(['message' => 'Data kunjungan balita berhasil dihapus']);
    }
}
