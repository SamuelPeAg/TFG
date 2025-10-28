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
        Schema::create('factura_entrenador', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_entrenador');
            $table->foreign('id_entrenador')->references('id')->on('entrenadores')->onDelete('cascade');

            $table->date('fecha');
            $table->decimal('importe', 10, 2);
            $table->string('estado');
            
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factura_entrenador');
    }
};
