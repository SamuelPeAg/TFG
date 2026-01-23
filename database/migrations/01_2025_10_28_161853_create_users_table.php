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
            $table->string('password');

            // Nuevo campo para el token de activación
            $table->string('activation_token', 60)->nullable()->unique();

            // Otros campos
            $table->string('foto_de_perfil')->nullable();
            $table->string('iban')->nullable()->unique();
            $table->text('firma_digital')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
