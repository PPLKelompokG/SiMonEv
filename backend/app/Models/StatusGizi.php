<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusGizi extends Model
{
    protected $fillable = [
        'penerima_bantuan_id',
        'tanggal_kunjungan',
        'berat_badan',
        'tinggi_badan',
        'bmi',
        'kategori_status',
        'usia_saat_ukur',
        'catatan',
        'recorded_by',
    ];

    protected $casts = [
        'tanggal_kunjungan' => 'date',
        'berat_badan' => 'decimal:2',
        'tinggi_badan' => 'decimal:2',
        'bmi' => 'decimal:2',
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
     * Calculate BMI from weight (kg) and height (cm).
     */
    public static function hitungBmi(float $beratKg, float $tinggiCm): float
    {
        $tinggiM = $tinggiCm / 100;
        return round($beratKg / ($tinggiM * $tinggiM), 2);
    }

    /**
     * Determine nutritional category based on BMI (WHO standard for adults).
     */
    public static function tentukanKategori(float $bmi): string
    {
        if ($bmi < 17) return 'gizi_buruk';
        if ($bmi < 18.5) return 'gizi_kurang';
        if ($bmi < 25) return 'normal';
        if ($bmi < 30) return 'gizi_lebih';
        return 'obesitas';
    }
}
