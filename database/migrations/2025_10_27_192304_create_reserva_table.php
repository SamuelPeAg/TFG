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
            $table->foreignId('id_usuario')->constrained();
            $table->date('fecha'); 
            $table->time('hora');
            $table->enum('estado',['pagada','pendiente','confirmado']); 
            $table->foreignId('id_clase')->constrained(); 
            $table->foreignId('id_reserva_entrenador')->constrained(); 
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
        Schema::dropIfExists('reserva');
    }
};
