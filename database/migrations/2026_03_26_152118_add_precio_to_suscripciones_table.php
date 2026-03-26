<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('suscripciones', function (Blueprint $table) {
            $table->decimal('precio', 10, 2)->default(0.00)->after('nombre');
        });
    }

    public function down()
    {
        Schema::table('suscripciones', function (Blueprint $table) {
            $table->dropColumn('precio');
        });
    }
};
