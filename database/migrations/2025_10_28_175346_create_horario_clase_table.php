<?php

use Illuminate.Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate.Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('horarios_clases', function (Blueprint $table) {
            $table->id();

            // Clave foránea para la clase (ej. "Yoga Principiante")
            $table->unsignedBigInteger('id_clase');
            $table->foreign('id_clase')->references('id')->on('clases')->onDelete('cascade');

            // Clave foránea para el entrenador que la imparte
            $table->unsignedBigInteger('id_entrenador');
            $table->foreign('id_entrenador')->references('id')->on('entrenadores')->onDelete('cascade');

            // Clave foránea para el centro donde se imparte
            $table->unsignedBigInteger('id_centro');
            $table->foreign('id_centro')->references('id')->on('centros')->onDelete('cascade');

            // Fecha y hora exactas de inicio de la clase
            $table->dateTime('fecha_hora_inicio');
            
            // Cuántas personas pueden apuntarse
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