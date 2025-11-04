<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // ID principal

            // Campos básicos
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');

            // Campos adicionales opcionales
            $table->string('foto_de_perfil')->nullable();
            $table->string('IBAN')->nullable()->unique();
            $table->text('FirmaDigital')->nullable();

            // Campos de control
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
