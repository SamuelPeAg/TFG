<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Entrenador;
use App\Models\Pago;

try {
    $entrenador = Entrenador::first();
    if (!$entrenador) {
        echo "No entrenador found\n";
        exit;
    }
    echo "Testing with Entrenador ID: " . $entrenador->id . "\n";
    $pagos = Pago::where(function($q) use ($entrenador) {
                    $q->where('entrenador_id', $entrenador->id)
                      ->orWhereHas('entrenadores', fn($qq) => $qq->where('entrenadores.id', $entrenador->id));
                })
                ->get();
    echo "Found " . $pagos->count() . " pagos\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
