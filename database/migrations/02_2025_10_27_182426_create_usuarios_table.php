<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            // Clave primaria Y foránea para la relación 1:1
            $table->unsignedBigInteger('user_id')->primary(); 
            
            // Tus campos de perfil
            $table->string('foto_de_perfil')->nullable();
            $table->string('IBAN')->nullable()->unique(); 
            $table->text('FirmaDigital')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            // La relación
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};