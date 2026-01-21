<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('nominas', function (Blueprint $table) {
        $table->id();
        
        // Relación con la tabla users (si borras al usuario, se borran sus nóminas)
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        $table->date('fecha_emision');
        $table->decimal('importe', 10, 2); // 10 dígitos total, 2 decimales
        $table->string('concepto')->nullable();
        $table->string('archivo_path')->nullable(); // Ruta del PDF
        
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
