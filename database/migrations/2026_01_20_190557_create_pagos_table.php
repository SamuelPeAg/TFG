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
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();

            // Relación con users (si se borra el usuario, la sesión queda sin user_id)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('entrenador_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Datos nuevos del formulario
            $table->string('centro');                // Ej: CLINICA / AIRA / OPEN
            $table->string('nombre_clase');          // Ej: Pilates, Crossfit...
            $table->string('metodo_pago');           // Ej: TPV / BIZUM / TRANSFERENCIA (lo que defináis)

            // Datos de pago
            $table->string('iban')->nullable();      // iban puede tener letras, NO int
            $table->decimal('Pago', 8, 2);           // dinero decimal

            // Fecha + hora real (tu input datetime-local)
            $table->dateTime('Fecharegistro');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
