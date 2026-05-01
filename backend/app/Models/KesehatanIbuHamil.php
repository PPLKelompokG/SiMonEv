<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KesehatanIbuHamil extends Model
{
    protected $table = 'kesehatan_ibu_hamil';

    protected $fillable = [
        'penerima_bantuan_id',
        'tanggal_kunjungan',
        'usia_kehamilan',
        'berat_badan',
        'tekanan_darah_sistolik',
        'tekanan_darah_diastolik',
        'status_kunjungan',
        'sudah_fe',
        'sudah_tt',
        'kondisi_kehamilan',
        'catatan',
        'recorded_by',
    ];

    protected $casts = [
        'tanggal_kunjungan'       => 'date',
        'berat_badan'             => 'decimal:2',
        'tekanan_darah_sistolik'  => 'decimal:1',
        'tekanan_darah_diastolik' => 'decimal:1',
        'sudah_fe'                => 'boolean',
        'sudah_tt'                => 'boolean',
    ];

    public function penerimaBantuan()
    {
        return $this->belongsTo(PenerimaBantuan::class, 'penerima_bantuan_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Tentukan kondisi kehamilan berdasarkan tekanan darah dan usia kehamilan.
     */
    public static function tentukanKondisi(
        ?float $sistolik = null,
        ?float $diastolik = null
    ): string {
        if ($sistolik === null || $diastolik === null) {
            return 'normal';
        }
        if ($sistolik >= 140 || $diastolik >= 90) {
            return 'risiko_tinggi'; // hipertensi
        }
        if ($sistolik < 90 || $diastolik < 60) {
            return 'risiko_rendah'; // hipotensi
        }
        return 'normal';
    }
}
