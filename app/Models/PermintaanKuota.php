<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermintaanKuota extends Model
{
    protected $fillable = [
        'program_bantuan_id',
        'jumlah_kuota',
        'justifikasi',
        'status',
        'requested_by',
    ];

    public function programBantuan()
    {
        return $this->belongsTo(ProgramBantuan::class, 'program_bantuan_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
