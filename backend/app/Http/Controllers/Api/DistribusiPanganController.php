<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DistribusiPangan;
use App\Models\DistribusiPanganItem;
use App\Models\PenerimaBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DistribusiPanganController extends Controller
{
    // ── Daftar Komoditas Pangan ────────────────────────────────────────────────
    public static array $KOMODITAS = [
        ['value' => 'beras',        'label' => 'Beras',         'satuan' => 'kg'],
        ['value' => 'minyak_goreng','label' => 'Minyak Goreng', 'satuan' => 'liter'],
        ['value' => 'gula_pasir',   'label' => 'Gula Pasir',    'satuan' => 'kg'],
        ['value' => 'telur',        'label' => 'Telur',         'satuan' => 'kg'],
        ['value' => 'tepung_terigu','label' => 'Tepung Terigu', 'satuan' => 'kg'],
        ['value' => 'kacang_hijau', 'label' => 'Kacang Hijau',  'satuan' => 'kg'],
        ['value' => 'susu',         'label' => 'Susu',          'satuan' => 'liter'],
        ['value' => 'ikan_kaleng',  'label' => 'Ikan Kaleng',   'satuan' => 'pcs'],
        ['value' => 'daging_ayam',  'label' => 'Daging Ayam',   'satuan' => 'kg'],
        ['value' => 'sayuran',      'label' => 'Sayuran',       'satuan' => 'kg'],
        ['value' => 'lainnya',      'label' => 'Lainnya',       'satuan' => 'pcs'],
    ];

    // ── GET /distribusi-pangan ─────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = DistribusiPangan::with([
            'penerimaBantuan:id,nik,nama,alamat',
            'programBantuan:id,nama_program',
            'petugas:id,name',
            'items',
        ])->latest('tanggal_distribusi');

        // Filter per periode
        if ($request->filled('periode')) {
            $query->where('periode_bulan', $request->periode);
        }

        // Filter per penerima
        if ($request->filled('penerima_id')) {
            $query->where('penerima_bantuan_id', $request->penerima_id);
        }

        $data = $query->get();

        return response()->json([
            'message' => 'Data distribusi pangan berhasil diambil',
            'data'    => $data,
        ]);
    }

    // ── GET /distribusi-pangan/statistik ──────────────────────────────────────
    public function statistik()
    {
        $totalDistribusi  = DistribusiPangan::count();
        $totalPenerima    = DistribusiPangan::distinct('penerima_bantuan_id')->count();
        $bulanIni         = now()->format('Y-m');
        $distribusiBulanIni = DistribusiPangan::where('periode_bulan', $bulanIni)->count();

        // Rekapitulasi komoditas
        $rekapKomoditas = DistribusiPanganItem::selectRaw('jenis_komoditas, satuan, SUM(kuantitas) as total_kuantitas, COUNT(*) as frekuensi')
            ->groupBy('jenis_komoditas', 'satuan')
            ->orderByDesc('total_kuantitas')
            ->get();

        // Distribusi per bulan (6 bulan terakhir)
        $perBulan = DistribusiPangan::selectRaw('periode_bulan, COUNT(*) as jumlah')
            ->where('tanggal_distribusi', '>=', now()->subMonths(6))
            ->groupBy('periode_bulan')
            ->orderBy('periode_bulan')
            ->get();

        return response()->json([
            'message' => 'Statistik distribusi pangan',
            'data'    => [
                'total_distribusi'      => $totalDistribusi,
                'total_penerima_aktif'  => $totalPenerima,
                'distribusi_bulan_ini'  => $distribusiBulanIni,
                'rekap_komoditas'       => $rekapKomoditas,
                'per_bulan'             => $perBulan,
            ],
        ]);
    }

    // ── GET /distribusi-pangan/penerima/{id} ──────────────────────────────────
    public function historyPenerima($id)
    {
        $penerima = PenerimaBantuan::findOrFail($id);

        $data = DistribusiPangan::with(['programBantuan:id,nama_program', 'petugas:id,name', 'items'])
            ->where('penerima_bantuan_id', $id)
            ->orderByDesc('tanggal_distribusi')
            ->get();

        return response()->json([
            'message'  => 'Histori distribusi pangan penerima',
            'penerima' => [
                'id'   => $penerima->id,
                'nik'  => $penerima->nik,
                'nama' => $penerima->nama,
            ],
            'data'     => $data,
        ]);
    }

    // ── GET /distribusi-pangan/penerima-disetujui ─────────────────────────────
    public function getApprovedPenerima()
    {
        $penerima = PenerimaBantuan::where('status', 'disetujui')
            ->select('id', 'nik', 'nama', 'alamat')
            ->orderBy('nama')
            ->get();

        return response()->json([
            'message' => 'Data penerima yang disetujui',
            'data'    => $penerima,
        ]);
    }

    // ── GET /distribusi-pangan/komoditas ──────────────────────────────────────
    public function komoditas()
    {
        return response()->json([
            'message' => 'Daftar komoditas pangan',
            'data'    => self::$KOMODITAS,
        ]);
    }

    // ── POST /distribusi-pangan ───────────────────────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'penerima_bantuan_id'   => 'required|exists:penerima_bantuans,id',
            'program_bantuan_id'    => 'nullable|exists:program_bantuans,id',
            'tanggal_distribusi'    => 'required|date',
            'periode_bulan'         => 'required|date_format:Y-m',
            'metode_distribusi'     => 'required|in:langsung,perwakilan,dikirim',
            'lokasi_distribusi'     => 'nullable|string|max:255',
            'catatan'               => 'nullable|string|max:2000',
            'items'                 => 'required|array|min:1',
            'items.*.jenis_komoditas' => 'required|string|max:100',
            'items.*.kuantitas'     => 'required|numeric|min:0.001',
            'items.*.satuan'        => 'required|string|max:20',
            'items.*.keterangan'    => 'nullable|string|max:500',
        ]);

        // Pastikan penerima statusnya disetujui
        $penerima = PenerimaBantuan::find($validated['penerima_bantuan_id']);
        if ($penerima->status !== 'disetujui') {
            return response()->json([
                'message' => 'Penerima bantuan belum diverifikasi / tidak aktif.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $distribusi = DistribusiPangan::create([
                'penerima_bantuan_id' => $validated['penerima_bantuan_id'],
                'program_bantuan_id'  => $validated['program_bantuan_id'] ?? null,
                'tanggal_distribusi'  => $validated['tanggal_distribusi'],
                'periode_bulan'       => $validated['periode_bulan'],
                'metode_distribusi'   => $validated['metode_distribusi'],
                'lokasi_distribusi'   => $validated['lokasi_distribusi'] ?? null,
                'petugas_id'          => auth()->id(),
                'catatan'             => $validated['catatan'] ?? null,
                'status'              => 'selesai',
            ]);

            foreach ($validated['items'] as $item) {
                DistribusiPanganItem::create([
                    'distribusi_pangan_id' => $distribusi->id,
                    'jenis_komoditas'      => $item['jenis_komoditas'],
                    'kuantitas'            => $item['kuantitas'],
                    'satuan'               => $item['satuan'],
                    'keterangan'           => $item['keterangan'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Distribusi pangan berhasil dicatat',
                'data'    => $distribusi->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name', 'items']),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    // ── GET /distribusi-pangan/{id} ───────────────────────────────────────────
    public function show($id)
    {
        $distribusi = DistribusiPangan::with([
            'penerimaBantuan:id,nik,nama,alamat',
            'programBantuan:id,nama_program',
            'petugas:id,name',
            'items',
        ])->find($id);

        if (!$distribusi) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail distribusi pangan',
            'data'    => $distribusi,
        ]);
    }

    // ── PUT /distribusi-pangan/{id} ───────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $distribusi = DistribusiPangan::findOrFail($id);

        $validated = $request->validate([
            'penerima_bantuan_id'   => 'required|exists:penerima_bantuans,id',
            'program_bantuan_id'    => 'nullable|exists:program_bantuans,id',
            'tanggal_distribusi'    => 'required|date',
            'periode_bulan'         => 'required|date_format:Y-m',
            'metode_distribusi'     => 'required|in:langsung,perwakilan,dikirim',
            'lokasi_distribusi'     => 'nullable|string|max:255',
            'catatan'               => 'nullable|string|max:2000',
            'items'                 => 'required|array|min:1',
            'items.*.jenis_komoditas' => 'required|string|max:100',
            'items.*.kuantitas'     => 'required|numeric|min:0.001',
            'items.*.satuan'        => 'required|string|max:20',
            'items.*.keterangan'    => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $distribusi->update([
                'penerima_bantuan_id' => $validated['penerima_bantuan_id'],
                'program_bantuan_id'  => $validated['program_bantuan_id'] ?? null,
                'tanggal_distribusi'  => $validated['tanggal_distribusi'],
                'periode_bulan'       => $validated['periode_bulan'],
                'metode_distribusi'   => $validated['metode_distribusi'],
                'lokasi_distribusi'   => $validated['lokasi_distribusi'] ?? null,
                'catatan'             => $validated['catatan'] ?? null,
            ]);

            // Hapus items lama lalu buat ulang
            $distribusi->items()->delete();

            foreach ($validated['items'] as $item) {
                DistribusiPanganItem::create([
                    'distribusi_pangan_id' => $distribusi->id,
                    'jenis_komoditas'      => $item['jenis_komoditas'],
                    'kuantitas'            => $item['kuantitas'],
                    'satuan'               => $item['satuan'],
                    'keterangan'           => $item['keterangan'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Distribusi pangan berhasil diperbarui',
                'data'    => $distribusi->load(['penerimaBantuan:id,nik,nama', 'petugas:id,name', 'items']),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    // ── DELETE /distribusi-pangan/{id} ────────────────────────────────────────
    public function destroy($id)
    {
        $distribusi = DistribusiPangan::findOrFail($id);
        $distribusi->items()->delete();
        $distribusi->delete();

        return response()->json(['message' => 'Data distribusi pangan berhasil dihapus']);
    }
}
