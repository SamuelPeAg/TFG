<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // El borrado de columnas de users ya se maneja en la migración base original (actualizada)

        Schema::table('clases', function (Blueprint $table) {
            $table->decimal('precio_hora', 8, 2)->default(0)->nullable()->after('duracion_minutos');
        });

        // Create Spatie role
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clases', function (Blueprint $table) {
            $table->dropColumn('precio_hora');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('foto_de_perfil')->nullable();
            $table->string('iban')->nullable()->unique();
            $table->text('firma_digital')->nullable();
            $table->decimal('precio_hora', 8, 2)->default(0)->nullable();
        });
    }
};
