<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenyaluranBantuan extends Model
{
    protected $fillable = [
        'penerima_bantuan_id',
        'program_bantuan_id',
        'tanggal_penyaluran',
        'jenis_bantuan',
        'jumlah_bantuan',
        'petugas_penyalur_id',
        'keterangan',
        'status_laporan',
        'status_approval',
        'approved_by',
        'approved_at',
        'catatan_koreksi',
    ];

    protected $casts = [
        'tanggal_penyaluran' => 'date',
        'jumlah_bantuan' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function penerimaBantuan()
    {
        return $this->belongsTo(PenerimaBantuan::class, 'penerima_bantuan_id');
    }

    public function programBantuan()
    {
        return $this->belongsTo(ProgramBantuan::class, 'program_bantuan_id');
    }

    public function petugasPenyalur()
    {
        return $this->belongsTo(User::class, 'petugas_penyalur_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
