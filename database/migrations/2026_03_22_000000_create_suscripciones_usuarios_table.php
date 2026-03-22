<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('suscripciones_usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('users')->onDelete('cascade');
            $table->foreignId('id_suscripcion')->constrained('suscripciones')->onDelete('cascade');
            $table->foreignId('id_entrenador')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('saldo_actual')->default(0);
            $table->timestamp('ultima_recarga')->nullable();
            $table->enum('estado', ['activo', 'cancelado'])->default('activo');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('suscripciones_usuarios');
    }
};
