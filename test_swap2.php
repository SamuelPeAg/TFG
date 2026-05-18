<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pago = App\Models\Pago::find(829);

$now = now();
$futurePagos = App\Models\Pago::with(['user', 'entrenadores', 'tiposCredito'])
    ->where('fecha_registro', '>', $now)
    ->where('centro', $pago->centro)
    ->where('tipo_clase', $pago->tipo_clase)->get();

foreach ($futurePagos as $fp) {
    echo "ID: {$fp->id}, Nombre: {$fp->nombre_clase}, Creditos: " . $fp->tiposCredito->pluck('id')->implode(',') . "\n";
}
