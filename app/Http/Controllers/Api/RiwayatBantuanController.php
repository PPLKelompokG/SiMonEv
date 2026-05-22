<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use App\Models\PenyaluranBantuan;
use App\Models\DistribusiPangan;
use App\Models\KunjunganRumah;
use App\Models\HistoriStatusPenerima;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * PBI-19 – Riwayat & Histori Bantuan per Penerima
 *
 * Menyediakan satu endpoint kronologis yang menggabungkan seluruh
 * riwayat bantuan yang pernah diterima oleh seorang penerima:
 *   - Penyaluran Bantuan (umum)
 *   - Distribusi Bantuan Pangan
 *   - Kunjungan Rumah oleh Petugas
 *   - Perubahan Status Penerima
 */
class RiwayatBantuanController extends Controller
{
    // ── GET /riwayat-bantuan/penerima/{id} ────────────────────────────────────
    /**
     * Ringkasan profil + seluruh riwayat kronologis seorang penerima.
     *
     * Query params:
     *   ?jenis      = penyaluran|distribusi_pangan|kunjungan_rumah|perubahan_status
     *   ?dari       = YYYY-MM-DD   (tanggal mulai)
     *   ?sampai     = YYYY-MM-DD   (tanggal selesai)
     *   ?per_page   = integer (default 20, max 100)
     *   ?page       = integer
     */
    public function histori(Request $request, int $id)
    {
        $penerima = PenerimaBantuan::with([
            'creator:id,name',
            'verifier:id,name',
        ])->findOrFail($id);

        $jenis    = $request->query('jenis');
        $dari     = $request->query('dari');
        $sampai   = $request->query('sampai');
        $perPage  = min((int) ($request->query('per_page', 20)), 100);

        // ── Kumpulkan semua kejadian ──────────────────────────────────────────
        $events = collect();

        // 1. Penyaluran Bantuan (umum)
        if (!$jenis || $jenis === 'penyaluran') {
            $penyaluran = PenyaluranBantuan::with([
                'programBantuan:id,nama_program',
                'petugasPenyalur:id,name',
                'approvedBy:id,name',
            ])
                ->where('penerima_bantuan_id', $id)
                ->when($dari,    fn($q) => $q->whereDate('tanggal_penyaluran', '>=', $dari))
                ->when($sampai,  fn($q) => $q->whereDate('tanggal_penyaluran', '<=', $sampai))
                ->get()
                ->map(fn($p) => [
                    'jenis'             => 'penyaluran',
                    'label'             => 'Penyaluran Bantuan',
                    'tanggal'           => $p->tanggal_penyaluran,
                    'tanggal_sort'      => Carbon::parse($p->tanggal_penyaluran)->timestamp,
                    'id_referensi'      => $p->id,
                    'jenis_bantuan'     => $p->jenis_bantuan,
                    'jumlah'            => $p->jumlah_bantuan,
                    'satuan'            => null,
                    'program'           => $p->programBantuan?->nama_program,
                    'petugas'           => $p->petugasPenyalur?->name,
                    'status'            => $p->status_laporan,
                    'status_approval'   => $p->status_approval,
                    'keterangan'        => $p->keterangan,
                    'detail'            => null,
                ]);

            $events = $events->merge($penyaluran);
        }

        // 2. Distribusi Bantuan Pangan
        if (!$jenis || $jenis === 'distribusi_pangan') {
            $distribusi = DistribusiPangan::with([
                'programBantuan:id,nama_program',
                'petugas:id,name',
                'items',
            ])
                ->where('penerima_bantuan_id', $id)
                ->when($dari,    fn($q) => $q->whereDate('tanggal_distribusi', '>=', $dari))
                ->when($sampai,  fn($q) => $q->whereDate('tanggal_distribusi', '<=', $sampai))
                ->get()
                ->map(fn($d) => [
                    'jenis'             => 'distribusi_pangan',
                    'label'             => 'Distribusi Bantuan Pangan',
                    'tanggal'           => $d->tanggal_distribusi,
                    'tanggal_sort'      => Carbon::parse($d->tanggal_distribusi)->timestamp,
                    'id_referensi'      => $d->id,
                    'jenis_bantuan'     => 'Pangan – ' . $d->ringkasan_komoditas,
                    'jumlah'            => $d->items->sum('kuantitas'),
                    'satuan'            => 'item(s)',
                    'program'           => $d->programBantuan?->nama_program,
                    'petugas'           => $d->petugas?->name,
                    'status'            => $d->status,
                    'status_approval'   => null,
                    'keterangan'        => $d->catatan,
                    'detail'            => $d->items->map(fn($i) => [
                        'komoditas' => $i->jenis_komoditas,
                        'kuantitas' => $i->kuantitas,
                        'satuan'    => $i->satuan,
                        'catatan'   => $i->keterangan,
                    ]),
                ]);

            $events = $events->merge($distribusi);
        }

        // 3. Kunjungan Rumah
        if (!$jenis || $jenis === 'kunjungan_rumah') {
            $kunjungan = KunjunganRumah::with(['petugas:id,name'])
                ->where('penerima_id', $id)
                ->when($dari,    fn($q) => $q->whereDate('tanggal', '>=', $dari))
                ->when($sampai,  fn($q) => $q->whereDate('tanggal', '<=', $sampai))
                ->get()
                ->map(fn($k) => [
                    'jenis'             => 'kunjungan_rumah',
                    'label'             => 'Kunjungan Rumah',
                    'tanggal'           => $k->tanggal,
                    'tanggal_sort'      => Carbon::parse($k->tanggal)->timestamp,
                    'id_referensi'      => $k->id,
                    'jenis_bantuan'     => 'Kunjungan Rumah',
                    'jumlah'            => null,
                    'satuan'            => null,
                    'program'           => null,
                    'petugas'           => $k->petugas?->name,
                    'status'            => null,
                    'status_approval'   => null,
                    'keterangan'        => $k->ringkasan_kondisi,
                    'detail'            => [
                        'temuan'       => $k->temuan_detail,
                        'rekomendasi'  => $k->rekomendasi,
                        'foto'         => $k->foto ? asset('storage/' . $k->foto) : null,
                    ],
                ]);

            $events = $events->merge($kunjungan);
        }

        // 4. Perubahan Status Penerima
        if (!$jenis || $jenis === 'perubahan_status') {
            $statusHistori = HistoriStatusPenerima::with(['petugas:id,name'])
                ->where('penerima_bantuan_id', $id)
                ->when($dari,    fn($q) => $q->whereDate('created_at', '>=', $dari))
                ->when($sampai,  fn($q) => $q->whereDate('created_at', '<=', $sampai))
                ->get()
                ->map(fn($h) => [
                    'jenis'             => 'perubahan_status',
                    'label'             => 'Perubahan Status Penerima',
                    'tanggal'           => $h->created_at->toDateString(),
                    'tanggal_sort'      => $h->created_at->timestamp,
                    'id_referensi'      => $h->id,
                    'jenis_bantuan'     => 'Perubahan Status: ' . $h->status_lama . ' → ' . $h->status_baru,
                    'jumlah'            => null,
                    'satuan'            => null,
                    'program'           => null,
                    'petugas'           => $h->petugas?->name,
                    'status'            => $h->status_baru,
                    'status_approval'   => null,
                    'keterangan'        => $h->alasan_perubahan,
                    'detail'            => [
                        'status_lama'       => $h->status_lama,
                        'status_baru'       => $h->status_baru,
                        'dokumen_pendukung' => $h->dokumen_pendukung,
                    ],
                ]);

            $events = $events->merge($statusHistori);
        }

        // ── Urutkan kronologis terbaru di atas ───────────────────────────────
        $sorted = $events->sortByDesc('tanggal_sort')->values();

        // ── Manual pagination ─────────────────────────────────────────────────
        $page      = max(1, (int) $request->query('page', 1));
        $total     = $sorted->count();
        $paginated = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        // ── Ringkasan statistik ───────────────────────────────────────────────
        $ringkasan = [
            'total_events'            => $total,
            'total_penyaluran'        => $events->where('jenis', 'penyaluran')->count(),
            'total_distribusi_pangan' => $events->where('jenis', 'distribusi_pangan')->count(),
            'total_kunjungan_rumah'   => $events->where('jenis', 'kunjungan_rumah')->count(),
            'total_perubahan_status'  => $events->where('jenis', 'perubahan_status')->count(),
            'bantuan_pertama'         => $sorted->last()['tanggal'] ?? null,
            'bantuan_terakhir'        => $sorted->first()['tanggal'] ?? null,
        ];

        return response()->json([
            'message'    => 'Riwayat & histori bantuan penerima berhasil diambil',
            'penerima'   => [
                'id'                  => $penerima->id,
                'nik'                 => $penerima->nik,
                'nama'                => $penerima->nama,
                'alamat'              => $penerima->alamat,
                'wilayah'             => $penerima->wilayah,
                'kondisi_ekonomi'     => $penerima->kondisi_ekonomi,
                'jumlah_tanggungan'   => $penerima->jumlah_tanggungan,
                'status'              => $penerima->status,
                'status_penerima'     => $penerima->status_penerima,
                'terdaftar_pada'      => $penerima->created_at?->toDateString(),
                'didaftarkan_oleh'    => $penerima->creator?->name,
                'diverifikasi_oleh'   => $penerima->verifier?->name,
                'diverifikasi_pada'   => $penerima->verified_at?->toDateString(),
            ],
            'ringkasan'  => $ringkasan,
            'pagination' => [
                'current_page'  => $page,
                'per_page'      => $perPage,
                'total'         => $total,
                'last_page'     => (int) ceil($total / $perPage),
                'has_more'      => ($page * $perPage) < $total,
            ],
            'riwayat'    => $paginated,
        ]);
    }

    // ── GET /riwayat-bantuan/penerima/{id}/ringkasan ──────────────────────────
    /**
     * Ringkasan cepat (statistik saja) untuk ditampilkan sebelum kunjungan.
     * Tidak menyertakan riwayat detail — cocok untuk header/card di frontend.
     */
    public function ringkasan(int $id)
    {
        $penerima = PenerimaBantuan::with(['creator:id,name', 'verifier:id,name'])
            ->findOrFail($id);

        $totalPenyaluran       = PenyaluranBantuan::where('penerima_bantuan_id', $id)->count();
        $totalDistribusiPangan = DistribusiPangan::where('penerima_bantuan_id', $id)->count();
        $totalKunjungan        = KunjunganRumah::where('penerima_id', $id)->count();
        $totalPerubahanStatus  = HistoriStatusPenerima::where('penerima_bantuan_id', $id)->count();

        // Bantuan terbaru (gabungan penyaluran & distribusi)
        $penyaluranTerakhir = PenyaluranBantuan::where('penerima_bantuan_id', $id)
            ->with(['petugasPenyalur:id,name', 'programBantuan:id,nama_program'])
            ->latest('tanggal_penyaluran')
            ->first();

        $distribusiTerakhir = DistribusiPangan::where('penerima_bantuan_id', $id)
            ->with(['petugas:id,name', 'programBantuan:id,nama_program', 'items'])
            ->latest('tanggal_distribusi')
            ->first();

        $kunjunganTerakhir = KunjunganRumah::where('penerima_id', $id)
            ->with(['petugas:id,name'])
            ->latest('tanggal')
            ->first();

        return response()->json([
            'message'  => 'Ringkasan riwayat bantuan penerima',
            'penerima' => [
                'id'               => $penerima->id,
                'nik'              => $penerima->nik,
                'nama'             => $penerima->nama,
                'alamat'           => $penerima->alamat,
                'wilayah'          => $penerima->wilayah,
                'kondisi_ekonomi'  => $penerima->kondisi_ekonomi,
                'status'           => $penerima->status,
                'status_penerima'  => $penerima->status_penerima,
            ],
            'statistik' => [
                'total_penyaluran'        => $totalPenyaluran,
                'total_distribusi_pangan' => $totalDistribusiPangan,
                'total_kunjungan_rumah'   => $totalKunjungan,
                'total_perubahan_status'  => $totalPerubahanStatus,
                'total_semua'             => $totalPenyaluran + $totalDistribusiPangan
                                            + $totalKunjungan + $totalPerubahanStatus,
            ],
            'terbaru'  => [
                'penyaluran' => $penyaluranTerakhir ? [
                    'tanggal'      => $penyaluranTerakhir->tanggal_penyaluran,
                    'jenis'        => $penyaluranTerakhir->jenis_bantuan,
                    'jumlah'       => $penyaluranTerakhir->jumlah_bantuan,
                    'program'      => $penyaluranTerakhir->programBantuan?->nama_program,
                    'petugas'      => $penyaluranTerakhir->petugasPenyalur?->name,
                    'status'       => $penyaluranTerakhir->status_laporan,
                ] : null,

                'distribusi_pangan' => $distribusiTerakhir ? [
                    'tanggal'      => $distribusiTerakhir->tanggal_distribusi,
                    'komoditas'    => $distribusiTerakhir->ringkasan_komoditas,
                    'program'      => $distribusiTerakhir->programBantuan?->nama_program,
                    'petugas'      => $distribusiTerakhir->petugas?->name,
                    'status'       => $distribusiTerakhir->status,
                ] : null,

                'kunjungan_rumah' => $kunjunganTerakhir ? [
                    'tanggal'          => $kunjunganTerakhir->tanggal,
                    'ringkasan_kondisi'=> $kunjunganTerakhir->ringkasan_kondisi,
                    'petugas'          => $kunjunganTerakhir->petugas?->name,
                ] : null,
            ],
        ]);
    }
}
