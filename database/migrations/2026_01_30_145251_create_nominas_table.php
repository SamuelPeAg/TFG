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
        Schema::create('nominas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('mes');
            $table->integer('anio');
            $table->string('concepto')->default('Nómina Mensual');
            $table->decimal('importe', 10, 2);
            $table->enum('estado_nomina', ['pendiente_revision', 'pendiente_pago', 'pagado'])->default('pendiente_revision');
            $table->date('fecha_pago')->nullable();
            $table->string('archivo_path')->nullable();
            $table->boolean('es_auto_generada')->default(false);
            $table->json('detalles')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominas');
    }
};
