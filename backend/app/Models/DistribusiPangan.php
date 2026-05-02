<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistribusiPangan extends Model
{
    protected $fillable = [
        'penerima_bantuan_id',
        'program_bantuan_id',
        'tanggal_distribusi',
        'periode_bulan',
        'metode_distribusi',
        'lokasi_distribusi',
        'petugas_id',
        'catatan',
        'status',
    ];

    protected $casts = [
        'tanggal_distribusi' => 'date',
    ];

    // ── Relationships ──────────────────────────────────────────────────────────

    public function penerimaBantuan()
    {
        return $this->belongsTo(PenerimaBantuan::class, 'penerima_bantuan_id');
    }

    public function programBantuan()
    {
        return $this->belongsTo(ProgramBantuan::class, 'program_bantuan_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    public function items()
    {
        return $this->hasMany(DistribusiPanganItem::class, 'distribusi_pangan_id');
    }

    // ── Accessors ──────────────────────────────────────────────────────────────

    /**
     * Label komoditas yang terdistribusi (ringkasan).
     */
    public function getRingkasanKomoditasAttribute(): string
    {
        return $this->items->map(fn($i) => $i->jenis_komoditas)->implode(', ');
    }
}
