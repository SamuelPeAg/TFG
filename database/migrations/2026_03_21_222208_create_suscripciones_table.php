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
        Schema::create('suscripciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipo_credito');
            $table->foreignId('id_centro')->nullable()->constrained('centros')->onDelete('cascade');
            $table->integer('creditos_por_periodo')->default(1);
            $table->enum('periodo', ['semanal', 'mensual'])->default('semanal');
            $table->integer('limite_acumulacion')->nullable()->default(0);
            $table->integer('meses_reset')->nullable()->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscripciones');
    }
};
