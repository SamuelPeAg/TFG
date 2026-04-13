<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('suscripciones_usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('suscripciones_usuarios', 'dia_recarga')) {
                $table->integer('dia_recarga')->nullable()->after('ultima_recarga');
            }
            if (!Schema::hasColumn('suscripciones_usuarios', 'fecha_vencimiento_suscripcion')) {
                $table->dateTime('fecha_vencimiento_suscripcion')->nullable()->after('dia_recarga');
            }
            if (!Schema::hasColumn('suscripciones_usuarios', 'pago_adelantado')) {
                $table->boolean('pago_adelantado')->default(false)->after('fecha_vencimiento_suscripcion');
            }
        });
    }

    public function down()
    {
        Schema::table('suscripciones_usuarios', function (Blueprint $table) {
            $table->dropColumn(['dia_recarga', 'fecha_vencimiento_suscripcion', 'pago_adelantado']);
        });
    }
};
