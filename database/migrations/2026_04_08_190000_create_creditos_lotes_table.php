<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('creditos_lotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('suscripcion_usuario_id')->constrained('suscripciones_usuarios')->onDelete('cascade');
            $table->foreignId('tipo_credito_id')->constrained('tipos_credito')->onDelete('cascade');
            $table->integer('cantidad_inicial');
            $table->integer('cantidad_actual');
            $table->dateTime('fecha_vencimiento');
            $table->foreignId('pago_id')->nullable()->constrained('pagos')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('creditos_lotes');
    }
};
