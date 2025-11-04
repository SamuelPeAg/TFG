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
        Schema::create('horarios_clases', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_clase');
            $table->unsignedBigInteger('id_entrenador');
            $table->unsignedBigInteger('id_centro');

            $table->foreign('id_clase')->references('id')->on('clases')->onDelete('cascade');
            $table->foreign('id_entrenador')->references('id')->on('entrenadores')->onDelete('cascade');
            $table->foreign('id_centro')->references('id')->on('centros')->onDelete('cascade');
            $table->dateTime('fecha_hora_inicio');
            $table->integer('capacidad'); 
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horarios_clases');
    }
}; 