<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KunjunganRumah extends Model
{
    protected $fillable = [
        'petugas_id',
        'penerima_bantuan_id',
        'tanggal_kunjungan',
        'status_kunjungan',
        'catatan',
        'foto_bukti'
    ];

    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    public function penerimaBantuan()
    {
        return $this->belongsTo(PenerimaBantuan::class);
    }
}
