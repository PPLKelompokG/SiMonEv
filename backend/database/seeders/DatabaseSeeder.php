<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Admin Utama
        \App\Models\User::create([
            'name' => 'Admin SiMonEv',
            'email' => 'admin@simonev.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // 2. Supervisor
        \App\Models\User::create([
            'name' => 'Supervisor Monitoring',
            'email' => 'supervisor@simonev.com',
            'password' => bcrypt('password123'),
            'role' => 'supervisor',
            'is_active' => true,
        ]);

        // 3. Petugas Lapangan
        \App\Models\User::create([
            'name' => 'Ahmad Petugas',
            'email' => 'petugas@simonev.com',
            'password' => bcrypt('password123'),
            'role' => 'petugas_lapangan',
            'is_active' => true,
        ]);
    }
}
