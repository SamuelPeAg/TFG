<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('id_usuario');
            $table->foreign('id_usuario')->references('id')->on('users')->onDelete('cascade'); // Apunta a 'users'

            $table->unsignedBigInteger('id_horario_clase');
            $table->foreign('id_horario_clase')->references('id')->on('horarios_clases')->onDelete('cascade');
            
            $table->enum('estado',['pagada','pendiente','confirmado']); 
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reserva');
    }
};