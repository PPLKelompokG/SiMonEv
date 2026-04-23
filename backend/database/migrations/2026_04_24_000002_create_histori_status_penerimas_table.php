<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('histori_status_penerimas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penerima_bantuan_id')->constrained('penerima_bantuans')->onDelete('cascade');
            $table->enum('status_lama', ['aktif', 'nonaktif', 'graduasi']);
            $table->enum('status_baru', ['aktif', 'nonaktif', 'graduasi']);
            $table->text('alasan_perubahan');
            $table->string('dokumen_pendukung')->nullable();
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('histori_status_penerimas');
    }
};
