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
        $table->id(); // ID único de la nómina
        
        // Relación: La nómina pertenece a un usuario. 
        // Si borras al usuario, se borran sus nóminas (onDelete cascade)
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Datos del periodo
        $table->integer('mes'); // Guardaremos el número (1 = Enero, 2 = Febrero...)
        $table->integer('anio'); // Ej: 2024
        
        // Detalles económicos
        $table->string('concepto')->default('Nómina Mensual'); // Texto descriptivo
        $table->decimal('importe', 10, 2); // Importe con 2 decimales (Ej: 1450.50)
        
        // Estado y Fecha
        $table->enum('estado', ['pagado', 'pendiente'])->default('pendiente');
        $table->date('fecha_pago')->nullable(); // Puede ser nula si aún no se ha pagado
        
        // Archivo (PDF)
        $table->string('archivo_path')->nullable(); // Ruta donde se guardará el PDF
        
        $table->timestamps(); // Created_at y updated_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominasentrenador');
    }
};
