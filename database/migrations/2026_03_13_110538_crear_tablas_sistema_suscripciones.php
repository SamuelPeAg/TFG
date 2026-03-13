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
        // 1. Tipos de crédito y configuración de suscripción
        Schema::create('suscripciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipo_credito'); // e.g. 'EP', 'Yoga'
            $table->unsignedBigInteger('id_centro')->nullable(); // null = todos los centros
            $table->integer('creditos_por_periodo');
            $table->enum('periodo', ['semanal', 'mensual']);
            $table->integer('limite_acumulacion')->default(0); // 0 = sin límite
            $table->integer('meses_reset')->nullable(); // Reset cada X meses
            $table->timestamps();
            
            $table->foreign('id_centro')->references('id')->on('centros')->onDelete('set null');
        });

        // 2. Usuarios suscritos y su saldo actual
        Schema::create('suscripciones_usuarios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_suscripcion');
            $table->unsignedBigInteger('id_entrenador'); // Quien la asignó
            $table->integer('saldo_actual')->default(0);
            $table->timestamp('ultima_recarga')->nullable();
            $table->timestamp('ultimo_reset')->nullable();
            $table->enum('estado', ['activo', 'cancelado'])->default('activo');
            $table->timestamps();

            $table->foreign('id_usuario')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_suscripcion')->references('id')->on('suscripciones')->onDelete('cascade');
            $table->foreign('id_entrenador')->references('id')->on('users')->onDelete('restrict');
        });

        // 3. Requisitos de créditos para las clases
        Schema::create('clase_creditos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_clase');
            $table->string('tipo_credito'); // Debe coincidir con el de la suscripción
            $table->unsignedBigInteger('id_centro')->nullable(); // Para obligar a que el crédito sea de un centro
            $table->integer('coste')->default(1);
            $table->timestamps();

            $table->foreign('id_clase')->references('id')->on('clases')->onDelete('cascade');
            $table->foreign('id_centro')->references('id')->on('centros')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clase_creditos');
        Schema::dropIfExists('suscripciones_usuarios');
        Schema::dropIfExists('suscripciones');
    }
};
