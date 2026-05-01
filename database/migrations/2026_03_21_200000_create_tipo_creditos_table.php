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
        Schema::create('tipos_credito', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('id_centro')->nullable()->constrained('centros')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('tipo_credito_sesiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tipo_credito_id')->constrained('tipos_credito')->onDelete('cascade');
            $table->foreignId('tipo_sesion_id')->constrained('tipos_sesion')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipo_credito_sesiones');
        Schema::dropIfExists('tipos_credito');
    }
};
