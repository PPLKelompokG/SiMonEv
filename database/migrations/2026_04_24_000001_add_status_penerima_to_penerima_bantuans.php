<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('penerima_bantuans', function (Blueprint $table) {
            $table->enum('status_penerima', ['aktif', 'nonaktif', 'graduasi'])->default('aktif')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('penerima_bantuans', function (Blueprint $table) {
            $table->dropColumn('status_penerima');
        });
    }
};
