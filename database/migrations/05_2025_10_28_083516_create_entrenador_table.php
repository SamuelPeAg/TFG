<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('entrenadores', function (Blueprint $table) {
        $table->id();
        $table->string('nombre');
        $table->string('email')->unique();
        $table->string('iban')->nullable();
        // AÑADIDO: Campo rol con valor por defecto
        $table->enum('rol', ['admin', 'entrenador'])->default('entrenador'); 
        $table->string('password');
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('entrenadores'); // Corregido
    }
};