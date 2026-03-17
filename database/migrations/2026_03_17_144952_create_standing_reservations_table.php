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
        Schema::create('standing_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nombre_clase'); 
            $table->string('tipo_clase'); 
            $table->string('centro'); 
            $table->unsignedTinyInteger('dia_semana'); // 0 (Sun) - 6 (Sat)
            $table->time('hora_inicio');
            $table->decimal('precio', 8, 2);
            $table->string('metodo_pago');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('standing_reservations');
    }
};
