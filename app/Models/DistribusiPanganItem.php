<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistribusiPanganItem extends Model
{
    protected $fillable = [
        'distribusi_pangan_id',
        'jenis_komoditas',
        'kuantitas',
        'satuan',
        'keterangan',
    ];

    protected $casts = [
        'kuantitas' => 'decimal:3',
    ];

    public function distribusiPangan()
    {
        return $this->belongsTo(DistribusiPangan::class, 'distribusi_pangan_id');
    }
}
