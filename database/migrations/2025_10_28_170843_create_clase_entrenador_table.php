<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clase_entrenador', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clase_id');
            $table->unsignedBigInteger('entrenador_id');

            $table->foreign('clase_id')->references('id')->on('clases')->onDelete('cascade');
            $table->foreign('entrenador_id')->references('id')->on('entrenadores')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clase_entrenador');
    }
};