<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin SiMonEv',
            'email' => 'admin@simonev.com',
            'password' => 'password123',
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Supervisor SiMonEv',
            'email' => 'supervisor@simonev.com',
            'password' => 'password123',
            'role' => 'supervisor',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Petugas Lapangan',
            'email' => 'petugas@simonev.com',
            'password' => 'password123',
            'role' => 'petugas_lapangan',
            'is_active' => true,
        ]);
    }
}