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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('empresa_id')->nullable()->after('id');
            $table->unsignedBigInteger('centro_id')->nullable()->after('empresa_id');

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('set null');
            $table->foreign('centro_id')->references('id')->on('centros')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['empresa_id']);
            $table->dropForeign(['centro_id']);
            $table->dropColumn(['empresa_id', 'centro_id']);
        });
    }
};
