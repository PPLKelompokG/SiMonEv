<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('family_members', function (Blueprint $table) {
        $table->id();
        $table->string('name');              // Nama
        $table->integer('age');              // Usia
        $table->string('relationship');      // Head, Spouse, Child
        $table->string('job')->nullable();   // Pekerjaan
        $table->string('education')->nullable(); // Pendidikan
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};
