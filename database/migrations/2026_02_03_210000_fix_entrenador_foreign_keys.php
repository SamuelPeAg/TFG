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
        // 1. Actualizar tabla 'pagos'
        Schema::table('pagos', function (Blueprint $table) {
            // Eliminar la clave foránea anterior si existe
            $table->dropForeign(['entrenador_id']);
            // Apuntar a la nueva tabla 'entrenadores'
            $table->foreign('entrenador_id')->references('id')->on('entrenadores')->onDelete('set null');
        });

        // 2. Actualizar tabla 'pago_entrenador'
        Schema::table('pago_entrenador', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->renameColumn('user_id', 'entrenador_id');
            $table->foreign('entrenador_id')->references('id')->on('entrenadores')->onDelete('cascade');
        });

        // 3. Actualizar tabla 'nominas'
        Schema::table('nominas', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('entrenadores')->onDelete('cascade');
        });

        // 4. Actualizar tabla 'horarios_clases'
        Schema::table('horarios_clases', function (Blueprint $table) {
            $table->dropForeign(['entrenador_id']);
            $table->foreign('entrenador_id')->references('id')->on('entrenadores')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('horarios_clases', function (Blueprint $table) {
            $table->dropForeign(['entrenador_id']);
            $table->foreign('entrenador_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('nominas', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('pago_entrenador', function (Blueprint $table) {
            $table->dropForeign(['entrenador_id']);
            $table->renameColumn('entrenador_id', 'user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('pagos', function (Blueprint $table) {
            $table->dropForeign(['entrenador_id']);
            $table->foreign('entrenador_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
