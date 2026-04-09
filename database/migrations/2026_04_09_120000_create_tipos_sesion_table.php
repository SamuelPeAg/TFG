<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_sesion', function (Blueprint $table) {
            $table->id();

            // Nombre visible en la UI: "Trío", "Dúo", "Grupo especial"...
            $table->string('nombre');

            // Slug técnico: debe ser único POR CENTRO (permitiendo duplicados en centros distintos)
            $table->string('slug');
            $table->unique(['slug', 'centro_id']);

            // Número de personas por defecto de este tipo de sesión
            $table->unsignedTinyInteger('capacidad_personas')->default(1);

            // Si es true → candado activado: la capacidad no se puede cambiar al crear el horario
            $table->boolean('capacidad_fija')->default(true);

            // Precio base por persona (se usa para auto-rellenar el precio al crear una sesión)
            $table->decimal('precio_base', 8, 2)->default(0.00);

            // Color hexadecimal para identificar visualmente el tipo en el calendario
            $table->string('color_hex', 7)->nullable()->default('#4BB7AE');

            // Si está activo (los inactivos no aparecen en el selector del calendario)
            $table->boolean('activo')->default(true);

            // Posición en el dropdown de selección
            $table->unsignedTinyInteger('orden')->default(0);

            // Descripción opcional (tooltip de ayuda en la UI)
            $table->text('descripcion')->nullable();

            // Centro al que pertenece este tipo de sesión.
            // null = disponible para todos los centros (global)
            $table->foreignId('centro_id')
                ->nullable()
                ->constrained('centros')
                ->onDelete('cascade');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_sesion');
    }
};
