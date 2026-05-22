<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use App\Models\StatusGizi;
use Illuminate\Http\Request;

class StatusGiziController extends Controller
{
    /**
     * Daftar semua catatan status gizi (terbaru dulu).
     */
    public function index()
    {
        $data = StatusGizi::with(['penerimaBantuan:id,nik,nama,alamat', 'petugas:id,name'])
            ->latest('tanggal_kunjungan')
            ->get();

        return response()->json([
            'message' => 'Berhasil mengambil data status gizi',
            'data' => $data,
        ]);
    }

    /**
     * Statistik ringkasan status gizi.
     */
    public function statistik()
    {
        $total = StatusGizi::count();
        $perKategori = StatusGizi::selectRaw('kategori_status, COUNT(*) as jumlah')
            ->groupBy('kategori_status')
            ->pluck('jumlah', 'kategori_status');

        $avgBmi = StatusGizi::avg('bmi');

        return response()->json([
            'message' => 'Statistik status gizi',
            'data' => [
                'total' => $total,
                'per_kategori' => $perKategori,
                'rata_rata_bmi' => round($avgBmi, 2),
            ],
        ]);
    }

    /**
     * Histori status gizi per penerima (untuk grafik tren).
     */
    public function historyPenerima($id)
    {
        $penerima = PenerimaBantuan::findOrFail($id);

        $data = StatusGizi::where('penerima_bantuan_id', $id)
            ->orderBy('tanggal_kunjungan', 'asc')
            ->get();

        return response()->json([
            'message' => 'Histori status gizi penerima',
            'penerima' => [
                'id' => $penerima->id,
                'nik' => $penerima->nik,
                'nama' => $penerima->nama,
            ],
            'data' => $data,
        ]);
    }

    /**
     * Catat status gizi baru — BMI & kategori dihitung otomatis.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'penerima_bantuan_id' => 'required|exists:penerima_bantuans,id',
            'tanggal_kunjungan'   => 'required|date',
            'berat_badan'         => 'required|numeric|min:1|max:500',
            'tinggi_badan'        => 'required|numeric|min:30|max:300',
            'usia_saat_ukur'      => 'nullable|integer|min:0|max:150',
            'catatan'             => 'nullable|string|max:2000',
        ]);

        // Hitung BMI dan tentukan kategori otomatis
        $bmi = StatusGizi::hitungBmi($validated['berat_badan'], $validated['tinggi_badan']);
        $kategori = StatusGizi::tentukanKategori($bmi);

        $statusGizi = StatusGizi::create([
            'penerima_bantuan_id' => $validated['penerima_bantuan_id'],
            'tanggal_kunjungan'   => $validated['tanggal_kunjungan'],
            'berat_badan'         => $validated['berat_badan'],
            'tinggi_badan'        => $validated['tinggi_badan'],
            'bmi'                 => $bmi,
            'kategori_status'     => $kategori,
            'usia_saat_ukur'      => $validated['usia_saat_ukur'] ?? null,
            'catatan'             => $validated['catatan'] ?? null,
            'recorded_by'         => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Data status gizi berhasil dicatat',
            'data' => $statusGizi->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name']),
        ], 201);
    }

    /**
     * Update data status gizi.
     */
    public function update(Request $request, $id)
    {
        $statusGizi = StatusGizi::findOrFail($id);

        $validated = $request->validate([
            'penerima_bantuan_id' => 'required|exists:penerima_bantuans,id',
            'tanggal_kunjungan'   => 'required|date',
            'berat_badan'         => 'required|numeric|min:1|max:500',
            'tinggi_badan'        => 'required|numeric|min:30|max:300',
            'usia_saat_ukur'      => 'nullable|integer|min:0|max:150',
            'catatan'             => 'nullable|string|max:2000',
        ]);

        $bmi = StatusGizi::hitungBmi($validated['berat_badan'], $validated['tinggi_badan']);
        $kategori = StatusGizi::tentukanKategori($bmi);

        $statusGizi->update([
            'penerima_bantuan_id' => $validated['penerima_bantuan_id'],
            'tanggal_kunjungan'   => $validated['tanggal_kunjungan'],
            'berat_badan'         => $validated['berat_badan'],
            'tinggi_badan'        => $validated['tinggi_badan'],
            'bmi'                 => $bmi,
            'kategori_status'     => $kategori,
            'usia_saat_ukur'      => $validated['usia_saat_ukur'] ?? null,
            'catatan'             => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'message' => 'Data status gizi berhasil diperbarui',
            'data' => $statusGizi->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name']),
        ]);
    }

    /**
     * Hapus data status gizi.
     */
    public function destroy($id)
    {
        $statusGizi = StatusGizi::findOrFail($id);
        $statusGizi->delete();

        return response()->json([
            'message' => 'Data status gizi berhasil dihapus',
        ]);
    }
}
