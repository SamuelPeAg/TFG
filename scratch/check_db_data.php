<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $count = \App\Models\Pago::count();
    echo "Total pagos: " . $count . "\n";
    $recent = \App\Models\Pago::latest('fecha_registro')->limit(5)->get();
    foreach ($recent as $p) {
        echo "- {$p->fecha_registro}: {$p->nombre_clase} ({$p->centro})\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
