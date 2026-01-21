<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('entrenador_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('centro');
            $table->string('nombre_clase');
            $table->string('metodo_pago');

            $table->string('iban')->nullable();
            $table->decimal('importe', 8, 2);
            $table->dateTime('fecha_registro');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
