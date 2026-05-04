<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluasiCapaian extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_bantuan_id',
        'periode',
        'nama_indikator',
        'satuan',
        'target',
        'realisasi',
        'skor_capaian',
        'status_capaian',
        'catatan',
        'dinilai_oleh',
    ];

    protected $casts = [
        'target' => 'decimal:2',
        'realisasi' => 'decimal:2',
        'skor_capaian' => 'decimal:2',
    ];

    public function programBantuan()
    {
        return $this->belongsTo(ProgramBantuan::class);
    }

    public function penilai()
    {
        return $this->belongsTo(User::class, 'dinilai_oleh');
    }
}
