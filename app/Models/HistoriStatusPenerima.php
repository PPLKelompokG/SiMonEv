<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoriStatusPenerima extends Model
{
    protected $fillable = [
        'penerima_bantuan_id',
        'status_lama',
        'status_baru',
        'alasan_perubahan',
        'dokumen_pendukung',
        'changed_by'
    ];

    public function penerimaBantuan()
    {
        return $this->belongsTo(PenerimaBantuan::class, 'penerima_bantuan_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
