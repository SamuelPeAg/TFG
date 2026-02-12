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
        Schema::table('entrenadores', function (Blueprint $table) {
            $table->timestamp('activation_token_created_at')->nullable()->after('activation_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entrenadores', function (Blueprint $table) {
            $table->dropColumn('activation_token_created_at');
        });
    }
};
