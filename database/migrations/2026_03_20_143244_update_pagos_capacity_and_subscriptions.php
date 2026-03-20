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
        Schema::table('pagos', function (Blueprint $table) {
            $table->unsignedInteger('capacidad')->nullable()->after('tipo_clase');
            $table->json('suscripciones_permitidas')->nullable()->after('capacidad'); // IDs de suscripciones
        });
    }

    public function down(): void
    {
        Schema::table('pagos', function (Blueprint $table) {
            $table->dropColumn(['capacidad', 'suscripciones_permitidas']);
        });
    }
};
