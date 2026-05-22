<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramBantuan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_program',
        'kategori_sdg',
        'anggaran',
        'periode',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'anggaran' => 'decimal:2',
    ];
}
