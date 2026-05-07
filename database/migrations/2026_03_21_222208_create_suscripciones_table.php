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
            $table->foreignId('id_centro')->nullable()->constrained('centros')->onDelete('cascade');
            $table->enum('periodo', ['semanal', 'mensual'])->default('semanal');
            $table->decimal('precio', 10, 2)->default(0);
            $table->integer('limite_acumulacion')->nullable()->default(0);
            $table->integer('meses_reset')->nullable()->default(1);
            $table->boolean('domiciliacion')->default(false);
            $table->timestamps();
        });

        Schema::create('suscripcion_creditos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('suscripcion_id')->constrained('suscripciones')->onDelete('cascade');
            $table->foreignId('tipo_credito_id')->constrained('tipos_credito')->onDelete('cascade');
            $table->integer('cantidad')->default(1);
            $table->integer('dias_caducidad')->default(30);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscripcion_creditos');
        Schema::dropIfExists('suscripciones');
    }
};
