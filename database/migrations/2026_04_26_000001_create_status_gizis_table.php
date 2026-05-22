<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('status_gizis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penerima_bantuan_id')->constrained('penerima_bantuans')->cascadeOnDelete();
            $table->date('tanggal_kunjungan');
            $table->decimal('berat_badan', 5, 2); // kg
            $table->decimal('tinggi_badan', 5, 2); // cm
            $table->decimal('bmi', 5, 2); // auto-calculated
            $table->enum('kategori_status', ['gizi_buruk', 'gizi_kurang', 'normal', 'gizi_lebih', 'obesitas']);
            $table->integer('usia_saat_ukur')->nullable();
            $table->text('catatan')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_gizis');
    }
};
