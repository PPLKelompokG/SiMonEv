<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kunjungan_rumahs', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('nama_penerima');
            $table->string('nik_penerima')->nullable();
            $table->unsignedBigInteger('penerima_id')->nullable(); // Optional link to actual penerima
            $table->string('ringkasan_kondisi');
            $table->text('temuan_detail')->nullable();
            $table->text('rekomendasi')->nullable();
            $table->string('foto')->nullable();
            $table->foreignId('petugas_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungan_rumahs');
    }
};
