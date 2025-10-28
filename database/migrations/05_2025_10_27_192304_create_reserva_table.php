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
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('id_usuario');
            $table->foreign('id_usuario')->references('id')->on('usuarios')->onDelete('cascade');

            $table->date('fecha'); 
            $table->time('hora');
            $table->enum('estado',['pagada','pendiente','confirmado']); 

            $table->unsignedBigInteger('id_clase');
            $table->foreign('id_clase')->references('id')->on('clases')->onDelete('cascade');

            $table->unsignedBigInteger('id_reserva_entrenador');
            $table->foreign('id_reserva_entrenador')->references('id')->on('reserva_entrenador')->onDelete('cascade');
            
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
