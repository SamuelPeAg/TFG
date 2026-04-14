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
        Schema::table('notificacion_entrenadors', function (Blueprint $table) {
            $table->text('respuesta')->nullable()->after('mensaje');
            $table->timestamp('fecha_respuesta')->nullable()->after('respuesta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notificacion_entrenadors', function (Blueprint $table) {
            $table->dropColumn(['respuesta', 'fecha_respuesta']);
        });
    }
};
