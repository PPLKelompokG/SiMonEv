<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PengingatJadwalDistribusi extends Notification
{
    use Queueable;

    /**
     * @param string $periodeBulan  Format YYYY-MM, misal: 2026-05
     * @param string $judul         Judul notifikasi
     * @param string $pesan         Isi pesan pengingat
     * @param string $tipe          'awal_periode' | 'pengingat_tengah' | 'pengingat_akhir'
     */
    public function __construct(
        public readonly string $periodeBulan,
        public readonly string $judul,
        public readonly string $pesan,
        public readonly string $tipe = 'pengingat_distribusi',
    ) {}

    /**
     * Gunakan channel database saja (tidak perlu SMTP).
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Data yang disimpan ke kolom `data` di tabel notifications.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type'          => 'pengingat_distribusi',
            'tipe'          => $this->tipe,
            'judul'         => $this->judul,
            'pesan'         => $this->pesan,
            'periode_bulan' => $this->periodeBulan,
            'icon'          => 'bell',
            'url'           => '/distribusi-pangan?periode=' . $this->periodeBulan,
        ];
    }
}
