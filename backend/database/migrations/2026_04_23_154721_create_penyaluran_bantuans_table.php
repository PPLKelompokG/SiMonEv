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
        if (!Schema::hasTable('penyaluran_bantuans')) {
            Schema::create('penyaluran_bantuans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('penerima_bantuan_id')->constrained('penerima_bantuans')->onDelete('cascade');
                $table->foreignId('program_bantuan_id')->nullable()->constrained('program_bantuans')->onDelete('set null');
                $table->date('tanggal_penyaluran');
                $table->string('jenis_bantuan');
                $table->decimal('jumlah_bantuan', 15, 2);
                $table->foreignId('petugas_penyalur_id')->constrained('users')->onDelete('cascade');
                $table->text('keterangan')->nullable();
                $table->string('status_laporan')->default('diajukan'); // 'draft', 'diajukan', 'disetujui', 'ditolak'
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penyaluran_bantuans');
    }
};
