<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('penerima_bantuans', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 16)->unique();
            $table->string('nama');
            $table->text('alamat');
            $table->string('wilayah')->nullable();
            $table->string('kondisi_ekonomi');
            $table->integer('jumlah_tanggungan')->default(0);
            $table->string('foto_ktp')->nullable();
            $table->enum('status', ['diajukan', 'diverifikasi', 'disetujui', 'ditolak'])->default('diajukan');
            $table->text('catatan_verifikasi')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penerima_bantuans');
    }
};