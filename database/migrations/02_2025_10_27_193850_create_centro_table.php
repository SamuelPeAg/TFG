<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('centros', function (Blueprint $table) {
            $table->id();
            $table->string("nombre");
            $table->string("cif")->nullable();
            $table->string("direccion")->nullable();
            $table->string("cp")->nullable();
            $table->string("ciudad")->nullable();
            $table->string("color_hex")->nullable()->default("#38b2ac");
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->nullOnDelete();
            $table->text("google_maps_link")->nullable();
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('centros');
    }
};