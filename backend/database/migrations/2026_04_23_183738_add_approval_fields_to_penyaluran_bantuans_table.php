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
        Schema::table('penyaluran_bantuans', function (Blueprint $table) {
            $table->string('status_approval')->default('pending'); // pending, approved, returned
            
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('catatan_koreksi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penyaluran_bantuans', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['status_approval', 'approved_by', 'approved_at', 'catatan_koreksi']);
        });
    }
};
