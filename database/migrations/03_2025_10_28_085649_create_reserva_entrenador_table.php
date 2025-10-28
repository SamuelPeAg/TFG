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
        Schema::create('reserva_entrenador', function (Blueprint $table) {
        $table->unsignedBigInteger('entrenador_id');
        $table->unsignedBigInteger('centro_id');
        $table->dateTime('fecha_inicio');
        $table->dateTime('fecha_fin');
        $table->boolean('disponible')->default(true);
        $table->timestamps();
        $table->softDeletes(); 
        
        $table->foreign('entrenador_id')->references('id')->on('entrenadores')->onDelete('cascade');
        $table->foreign('centro_id')->references('id')->on('centros')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reserva_entrenador');
    }
};
