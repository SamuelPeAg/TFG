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
        Schema::table('centros', function (Blueprint $table) {
            $table->string('serie_facturacion', 10)->nullable();
            $table->integer('ultimo_numero_factura')->default(0);
            $table->string("color_hex")->nullable()->default("#38b2ac");
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->string('tag')->nullable();
            $table->string('icon')->nullable()->default('fa-heart-pulse');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('centros', function (Blueprint $table) {
            //
        });
    }
};
