<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios_clases', function (Blueprint $table) {
            $table->id();

            $table->foreignId('clase_id')
                ->constrained('clases')
                ->cascadeOnDelete();

            $table->foreignId('entrenador_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('centro_id')
                ->constrained('centros')
                ->cascadeOnDelete();

            $table->dateTime('fecha_hora_inicio');
            $table->unsignedInteger('capacidad');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios_clases');
    }
};
