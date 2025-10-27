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
        Schema::create('clases', function (Blueprint $table) {
            $table->id(); 
            $table->string('nombre'); 
            $table->text('descripcion')->nullable(); 
            $table->integer('duracion_minutos')->nullable(); 
            $table->enum('nivel', ['facil', 'medio', 'dificil']); 
            $table->foreignId('id_centro')->constrained();
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
        Schema::dropIfExists('clases');
    }
};
