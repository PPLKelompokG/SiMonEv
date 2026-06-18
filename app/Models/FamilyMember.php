<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    protected $fillable = [
        'penerima_bantuan_id',
        'name',
        'age',
        'relationship',
        'job',
        'education'
    ];

    public function penerimaBantuan()
    {
        return $this->belongsTo(PenerimaBantuan::class, 'penerima_bantuan_id');
    }
}
