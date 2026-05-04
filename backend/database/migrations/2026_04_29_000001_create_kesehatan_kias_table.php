<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Tabel untuk monitoring ibu hamil
        Schema::create('kesehatan_ibu_hamil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penerima_bantuan_id')->constrained('penerima_bantuans')->cascadeOnDelete();
            $table->date('tanggal_kunjungan');
            $table->integer('usia_kehamilan'); // dalam minggu
            $table->decimal('berat_badan', 5, 2); // kg
            $table->decimal('tekanan_darah_sistolik', 5, 1)->nullable(); // mmHg
            $table->decimal('tekanan_darah_diastolik', 5, 1)->nullable(); // mmHg
            $table->enum('status_kunjungan', ['K1', 'K2', 'K3', 'K4'])->default('K1'); // jenis kunjungan ANC
            $table->boolean('sudah_fe')->default(false); // tablet Fe (zat besi)
            $table->boolean('sudah_tt')->default(false); // imunisasi Tetanus Toxoid
            $table->enum('kondisi_kehamilan', ['normal', 'risiko_rendah', 'risiko_tinggi'])->default('normal');
            $table->text('catatan')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Tabel untuk monitoring balita (0-59 bulan)
        Schema::create('kesehatan_balita', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penerima_bantuan_id')->constrained('penerima_bantuans')->cascadeOnDelete();
            $table->string('nama_balita');
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['laki_laki', 'perempuan']);
            $table->date('tanggal_kunjungan');
            $table->integer('usia_bulan'); // usia saat kunjungan posyandu
            $table->decimal('berat_badan', 5, 2); // kg
            $table->decimal('tinggi_badan', 5, 2)->nullable(); // cm
            $table->decimal('lingkar_kepala', 5, 2)->nullable(); // cm
            // Imunisasi
            $table->boolean('imunisasi_hb0')->default(false);
            $table->boolean('imunisasi_bcg')->default(false);
            $table->boolean('imunisasi_dpt_hb_hib_1')->default(false);
            $table->boolean('imunisasi_dpt_hb_hib_2')->default(false);
            $table->boolean('imunisasi_dpt_hb_hib_3')->default(false);
            $table->boolean('imunisasi_polio_1')->default(false);
            $table->boolean('imunisasi_polio_2')->default(false);
            $table->boolean('imunisasi_polio_3')->default(false);
            $table->boolean('imunisasi_polio_4')->default(false);
            $table->boolean('imunisasi_campak')->default(false);
            $table->boolean('imunisasi_mr')->default(false);
            // Status gizi balita berdasarkan BB/U
            $table->enum('status_gizi_balita', ['gizi_buruk', 'gizi_kurang', 'normal', 'gizi_lebih', 'obesitas'])->nullable();
            $table->boolean('dapat_vit_a')->default(false); // Vitamin A
            $table->text('catatan')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kesehatan_balita');
        Schema::dropIfExists('kesehatan_ibu_hamil');
    }
};
