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
        // Tabel utama distribusi pangan
        if (!Schema::hasTable('distribusi_pangans')) {
            Schema::create('distribusi_pangans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('penerima_bantuan_id')->constrained('penerima_bantuans')->onDelete('cascade');
                $table->foreignId('program_bantuan_id')->nullable()->constrained('program_bantuans')->onDelete('set null');
                $table->date('tanggal_distribusi');
                $table->string('periode_bulan', 7); // Format: YYYY-MM, e.g. 2026-04
                $table->enum('metode_distribusi', ['langsung', 'perwakilan', 'dikirim'])->default('langsung');
                $table->string('lokasi_distribusi')->nullable();
                $table->foreignId('petugas_id')->constrained('users')->onDelete('cascade');
                $table->text('catatan')->nullable();
                $table->enum('status', ['draft', 'selesai'])->default('selesai');
                $table->timestamps();
            });
        }

        // Tabel item detail komoditas pangan per distribusi
        if (!Schema::hasTable('distribusi_pangan_items')) {
            Schema::create('distribusi_pangan_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('distribusi_pangan_id')->constrained('distribusi_pangans')->onDelete('cascade');
                $table->string('jenis_komoditas'); // beras, minyak_goreng, gula, dll
                $table->decimal('kuantitas', 10, 3);
                $table->string('satuan', 20); // kg, liter, pcs, dll
                $table->text('keterangan')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distribusi_pangan_items');
        Schema::dropIfExists('distribusi_pangans');
    }
};
