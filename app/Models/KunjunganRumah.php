<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KunjunganRumah extends Model
{
    protected $fillable = [
        'tanggal',
        'nama_penerima',
        'nik_penerima',
        'penerima_id',
        'ringkasan_kondisi',
        'temuan_detail',
        'rekomendasi',
        'foto',
        'petugas_id'
    ];

    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    public function penerima()
    {
        return $this->belongsTo(PenerimaBantuan::class, 'penerima_id');
    }
}
