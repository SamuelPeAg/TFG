<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entrenadores', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();

            $table->string('dni')->nullable()->unique();
            $table->string('foto_de_perfil')->nullable();
            
            // Estado / Activación
            $table->boolean('activo')->default(false);
            $table->string('activation_token')->nullable()->unique();

            // Datos laborales/Staff
            $table->string('iban')->nullable()->unique();
            $table->decimal('precio_hora', 10, 2)->default(0);

            // Relaciones consolidadas
            $table->foreignId('centro_id')->nullable()->constrained('centros')->nullOnDelete();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entrenadores');
    }
};
