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
        Schema::create('notificacion_entrenadors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entrenador_id');
            $table->unsignedBigInteger('destinatario_id')->nullable();
            $table->string('titulo');
            $table->text('mensaje');
            $table->text('respuesta')->nullable();
            $table->timestamp('fecha_respuesta')->nullable();
            $table->string('tipo')->default('general'); // incidencia, clase, general
            $table->boolean('leido')->default(false);
            $table->timestamps();

            $table->foreign('entrenador_id')->references('id')->on('entrenadores')->onDelete('cascade');
            $table->foreign('destinatario_id')->references('id')->on('entrenadores')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificacion_entrenadors');
    }
};
