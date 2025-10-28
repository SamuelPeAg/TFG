<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clases', function (Blueprint $table) {
            $table->id(); 
            $table->string('nombre'); 
            $table->text('descripcion')->nullable(); 
            $table->integer('duracion_minutos')->nullable(); 
            
            $table->enum('nivel', ['facil', 'medio', 'dificil']); 

            $table->unsignedBigInteger('id_centro');
            $table->foreign('id_centro')->references('id')->on('centros')->onDelete('cascade');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clases');
    }
};