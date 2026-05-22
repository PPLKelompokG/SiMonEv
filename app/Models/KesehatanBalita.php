<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KesehatanBalita extends Model
{
    protected $table = 'kesehatan_balita';

    protected $fillable = [
        'penerima_bantuan_id',
        'nama_balita',
        'tanggal_lahir',
        'jenis_kelamin',
        'tanggal_kunjungan',
        'usia_bulan',
        'berat_badan',
        'tinggi_badan',
        'lingkar_kepala',
        'imunisasi_hb0',
        'imunisasi_bcg',
        'imunisasi_dpt_hb_hib_1',
        'imunisasi_dpt_hb_hib_2',
        'imunisasi_dpt_hb_hib_3',
        'imunisasi_polio_1',
        'imunisasi_polio_2',
        'imunisasi_polio_3',
        'imunisasi_polio_4',
        'imunisasi_campak',
        'imunisasi_mr',
        'status_gizi_balita',
        'dapat_vit_a',
        'catatan',
        'recorded_by',
    ];

    protected $casts = [
        'tanggal_lahir'          => 'date',
        'tanggal_kunjungan'      => 'date',
        'berat_badan'            => 'decimal:2',
        'tinggi_badan'           => 'decimal:2',
        'lingkar_kepala'         => 'decimal:2',
        'imunisasi_hb0'          => 'boolean',
        'imunisasi_bcg'          => 'boolean',
        'imunisasi_dpt_hb_hib_1' => 'boolean',
        'imunisasi_dpt_hb_hib_2' => 'boolean',
        'imunisasi_dpt_hb_hib_3' => 'boolean',
        'imunisasi_polio_1'      => 'boolean',
        'imunisasi_polio_2'      => 'boolean',
        'imunisasi_polio_3'      => 'boolean',
        'imunisasi_polio_4'      => 'boolean',
        'imunisasi_campak'       => 'boolean',
        'imunisasi_mr'           => 'boolean',
        'dapat_vit_a'            => 'boolean',
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
     * Hitung persentase kelengkapan imunisasi dasar lengkap.
     */
    public function persentaseImunisasi(): float
    {
        $imunisasiFields = [
            'imunisasi_hb0', 'imunisasi_bcg',
            'imunisasi_dpt_hb_hib_1', 'imunisasi_dpt_hb_hib_2', 'imunisasi_dpt_hb_hib_3',
            'imunisasi_polio_1', 'imunisasi_polio_2', 'imunisasi_polio_3', 'imunisasi_polio_4',
            'imunisasi_campak', 'imunisasi_mr',
        ];
        $total = count($imunisasiFields);
        $sudah = 0;
        foreach ($imunisasiFields as $field) {
            if ($this->$field) $sudah++;
        }
        return round(($sudah / $total) * 100, 1);
    }

    /**
     * Tentukan status gizi balita berdasarkan BB/U (sederhana).
     */
    public static function tentukanStatusGizi(float $beratKg, int $usiaBulan, string $jenisKelamin): string
    {
        // Tabel referensi median BB/U WHO (disederhanakan)
        // nilai_normal_median berdasarkan usia bulan untuk laki-laki dan perempuan
        $medianBbU = [
            // [usia_bulan => median_laki, median_perempuan]
            0  => [3.3, 3.2], 1  => [4.5, 4.2], 2  => [5.6, 5.1], 3  => [6.4, 5.8],
            6  => [7.9, 7.3], 9  => [9.0, 8.4], 12 => [9.6, 8.9], 18 => [10.9, 10.2],
            24 => [12.2, 11.5], 36 => [14.3, 13.9], 48 => [16.3, 15.9], 59 => [18.3, 17.7],
        ];

        // Cari median terdekat
        $keys = array_keys($medianBbU);
        $closest = $keys[0];
        foreach ($keys as $key) {
            if (abs($key - $usiaBulan) < abs($closest - $usiaBulan)) {
                $closest = $key;
            }
        }

        $medianIdx  = $jenisKelamin === 'laki_laki' ? 0 : 1;
        $median     = $medianBbU[$closest][$medianIdx];
        $rasio      = $beratKg / $median;

        if ($rasio < 0.60) return 'gizi_buruk';
        if ($rasio < 0.80) return 'gizi_kurang';
        if ($rasio <= 1.20) return 'normal';
        if ($rasio <= 1.40) return 'gizi_lebih';
        return 'obesitas';
    }
}
