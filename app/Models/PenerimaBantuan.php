<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenerimaBantuan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nik',
        'nama',
        'alamat',
        'wilayah',
        'kondisi_ekonomi',
        'jumlah_tanggungan',
        'foto_ktp',
        'status',
        'status_penerima',
        'catatan_verifikasi',
        'created_by',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function familyMembers()
    {
        return $this->hasMany(FamilyMember::class, 'penerima_bantuan_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function historiStatus()
    {
        return $this->hasMany(HistoriStatusPenerima::class, 'penerima_bantuan_id');
    }

    public function statusGizi()
    {
        return $this->hasMany(StatusGizi::class, 'penerima_bantuan_id');
    }

    public function kesehatanIbuHamil()
    {
        return $this->hasMany(KesehatanIbuHamil::class, 'penerima_bantuan_id');
    }

    public function kesehatanBalita()
    {
        return $this->hasMany(KesehatanBalita::class, 'penerima_bantuan_id');
    }

    public function penyaluranBantuan()
    {
        return $this->hasMany(PenyaluranBantuan::class, 'penerima_bantuan_id');
    }

    public function distribusiPangan()
    {
        return $this->hasMany(DistribusiPangan::class, 'penerima_bantuan_id');
    }

    public function kunjunganRumah()
    {
        return $this->hasMany(KunjunganRumah::class, 'penerima_id');
    }
}