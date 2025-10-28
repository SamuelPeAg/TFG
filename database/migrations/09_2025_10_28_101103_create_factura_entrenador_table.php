<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factura_entrenador', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_entrenador');
            $table->foreign('id_entrenador')->references('id')->on('entrenadores')->onDelete('cascade');

            $table->date('fecha');
            $table->decimal('importe', 10, 2);
            $table->enum('estado', ['pendiente', 'pagada', 'anulada'])->default('pendiente');
            
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factura_entrenador');
    }
};