<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $count = \DB::table('pagos')->count();
    echo "Total pagos: " . $count . "\n";
    
    $columns = \DB::getSchemaBuilder()->getColumnListing('pagos');
    echo "Columnas en 'pagos': " . implode(', ', $columns) . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
