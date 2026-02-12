<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

try {
    Schema::table('pago_entrenador', function ($table) {
        $table->renameColumn('user_id', 'entrenador_id');
    });
    echo "Column renamed successfully\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
