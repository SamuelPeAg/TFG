<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$q = App\Models\Pago::whereHas('tiposCredito', function($q) {
    $q->whereIn('tipo_credito_id', [1, 2]);
});

try {
    $q->first();
    echo "Success!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
