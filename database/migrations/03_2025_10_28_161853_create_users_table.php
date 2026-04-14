<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email')->unique();
            $table->boolean('activo')->default(false);
            $table->string('password')->nullable();
            $table->timestamp('email_verified_at')->nullable();

            $table->string('dni')->nullable()->unique();
            $table->string('direccion')->nullable();
            $table->string('codigo_postal')->nullable();
            $table->string('ciudad')->nullable();
            
            $table->string('activation_token', 60)->nullable()->unique();
            $table->timestamp('activation_token_expires_at')->nullable();
            $table->string('foto_de_perfil')->nullable();
            
            // Relaciones consolidadas
            $table->foreignId('centro_id')->nullable()->constrained('centros')->nullOnDelete();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->nullOnDelete();

            $table->decimal('altura', 5, 2)->nullable();
            $table->decimal('peso', 5, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('user_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('peso', 5, 2);
            $table->decimal('altura', 5, 2);
            $table->decimal('imc', 5, 2);
            $table->date('measured_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_measurements');
        Schema::dropIfExists('users');
    }
};
