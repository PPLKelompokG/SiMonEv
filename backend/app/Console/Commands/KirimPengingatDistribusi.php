<?php

namespace App\Console\Commands;

use App\Models\DistribusiPangan;
use App\Models\User;
use App\Notifications\PengingatJadwalDistribusi;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Artisan command untuk mengirim pengingat jadwal distribusi bantuan pangan.
 *
 * Aturan pengiriman (dijalankan setiap hari oleh scheduler):
 *  - Tgl 1 tiap bulan  → Pengingat awal periode: distribusi bulan ini sudah dimulai
 *  - Tgl 8 tiap bulan  → Pengingat tengah: jika distribusi bulan ini BELUM ada sama sekali
 *  - Tgl 15 tiap bulan → Pengingat akhir: jika distribusi bulan ini MASIH belum ada
 *
 * Target penerima: user aktif dengan role 'petugas_lapangan' atau 'supervisor'.
 */
class KirimPengingatDistribusi extends Command
{
    protected $signature   = 'notifikasi:kirim-pengingat-distribusi
                                {--force : Paksa kirim pengingat terlepas dari tanggal hari ini}
                                {--tipe= : Pilih tipe pengingat: awal_periode|pengingat_tengah|pengingat_akhir}';

    protected $description = 'Kirim pengingat jadwal distribusi bantuan kepada Petugas Lapangan dan Supervisor';

    public function handle(): int
    {
        $sekarang     = Carbon::now();
        $tanggal      = (int) $sekarang->format('j'); // day of month, no leading zero
        $periodeBulan = $sekarang->format('Y-m');

        $force = $this->option('force');
        $tipeOpt = $this->option('tipe');

        // Tentukan tipe pengingat berdasarkan tanggal, kecuali ada opsi override
        $tipe = $this->tentukanTipe($tanggal, $force, $tipeOpt);

        if ($tipe === null) {
            $this->info("[{$sekarang->toDateTimeString()}] Hari ini (tgl {$tanggal}) bukan hari pengiriman pengingat. Tidak ada notifikasi dikirim.");
            return self::SUCCESS;
        }

        // Cek apakah sudah ada distribusi tercatat bulan ini (untuk tgl 8 & 15)
        if (in_array($tipe, ['pengingat_tengah', 'pengingat_akhir'])) {
            $sudahAdaDistribusi = DistribusiPangan::where('periode_bulan', $periodeBulan)->exists();

            if ($sudahAdaDistribusi) {
                $this->info("[{$sekarang->toDateTimeString()}] Distribusi periode {$periodeBulan} sudah tercatat. Pengingat {$tipe} tidak dikirim.");
                return self::SUCCESS;
            }
        }

        // Ambil semua user penerima yang aktif
        $penerima = User::whereIn('role', ['petugas_lapangan', 'supervisor'])
            ->where('is_active', true)
            ->get();

        if ($penerima->isEmpty()) {
            $this->warn('Tidak ada user petugas_lapangan / supervisor yang aktif ditemukan.');
            return self::SUCCESS;
        }

        // Buat konten notifikasi
        ['judul' => $judul, 'pesan' => $pesan] = $this->buatKonten($tipe, $periodeBulan, $sekarang);

        // Kirim notifikasi ke setiap penerima
        $terkirim = 0;
        foreach ($penerima as $user) {
            $user->notify(new PengingatJadwalDistribusi(
                periodeBulan: $periodeBulan,
                judul: $judul,
                pesan: $pesan,
                tipe: $tipe,
            ));
            $terkirim++;
        }

        $this->info("[{$sekarang->toDateTimeString()}] Pengingat '{$tipe}' periode {$periodeBulan} berhasil dikirim ke {$terkirim} pengguna.");
        return self::SUCCESS;
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Tentukan tipe pengingat berdasarkan tanggal hari ini.
     */
    private function tentukanTipe(int $tanggal, bool $force, ?string $tipeOpt): ?string
    {
        // Override manual via opsi --tipe
        if ($tipeOpt !== null) {
            return in_array($tipeOpt, ['awal_periode', 'pengingat_tengah', 'pengingat_akhir'])
                ? $tipeOpt
                : null;
        }

        // Force kirim → default ke awal_periode
        if ($force) {
            return 'awal_periode';
        }

        return match (true) {
            $tanggal === 1  => 'awal_periode',
            $tanggal === 8  => 'pengingat_tengah',
            $tanggal === 15 => 'pengingat_akhir',
            default         => null,
        };
    }

    /**
     * Buat judul dan pesan notifikasi sesuai tipe.
     */
    private function buatKonten(string $tipe, string $periodeBulan, Carbon $sekarang): array
    {
        $bulanLabel = $sekarang->translatedFormat('F Y'); // misal: Mei 2026

        return match ($tipe) {
            'awal_periode' => [
                'judul' => "📦 Distribusi Bantuan {$bulanLabel} Dimulai",
                'pesan' => "Periode distribusi bantuan pangan untuk bulan {$bulanLabel} telah dimulai. "
                         . "Segera lakukan pencatatan distribusi kepada penerima bantuan yang terdaftar.",
            ],
            'pengingat_tengah' => [
                'judul' => "⚠️ Pengingat: Distribusi {$bulanLabel} Belum Dicatat",
                'pesan' => "Distribusi bantuan pangan periode {$bulanLabel} belum ada yang tercatat hingga hari ini. "
                         . "Pastikan pencatatan distribusi segera dilakukan.",
            ],
            'pengingat_akhir' => [
                'judul' => "🚨 Peringatan: Distribusi {$bulanLabel} Belum Tercatat!",
                'pesan' => "Sudah memasuki pertengahan bulan namun distribusi pangan periode {$bulanLabel} "
                         . "belum ada catatan sama sekali. Segera laporkan kepada Supervisor.",
            ],
            default => [
                'judul' => "📋 Pengingat Distribusi {$bulanLabel}",
                'pesan' => "Harap perhatikan jadwal distribusi bantuan pangan periode {$bulanLabel}.",
            ],
        };
    }
}
