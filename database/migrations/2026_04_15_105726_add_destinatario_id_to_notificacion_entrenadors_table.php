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
            $table->unsignedBigInteger('destinatario_id')->nullable()->after('entrenador_id');
            $table->foreign('destinatario_id')->references('id')->on('entrenadores')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notificacion_entrenadors', function (Blueprint $table) {
            $table->dropForeign(['destinatario_id']);
            $table->dropColumn('destinatario_id');
        });
    }
};
