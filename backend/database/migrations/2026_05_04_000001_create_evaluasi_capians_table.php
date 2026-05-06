<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluasi_capaians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_bantuan_id')->constrained('program_bantuans')->onDelete('cascade');
            $table->string('periode'); // e.g. "2026-Q1", "2026-01", "Semester 1 2026"
            $table->string('nama_indikator');
            $table->string('satuan')->default('orang'); // orang, persen, rupiah, unit
            $table->decimal('target', 15, 2);
            $table->decimal('realisasi', 15, 2);
            $table->decimal('skor_capaian', 8, 2)->default(0); // (realisasi / target) * 100
            $table->enum('status_capaian', ['tercapai', 'tidak_tercapai', 'melebihi_target'])->default('tidak_tercapai');
            $table->text('catatan')->nullable();
            $table->foreignId('dinilai_oleh')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluasi_capaians');
    }
};
