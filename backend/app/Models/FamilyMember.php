<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    protected $fillable = [
    'name',
    'age',
    'relationship',
    'job',
    'education'
];
}
