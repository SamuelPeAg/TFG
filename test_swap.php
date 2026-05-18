<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pagoId = App\Models\Pago::where('nombre_clase', 'Movilidad Articular')->whereNotNull('user_id')->first()->id ?? null;
if (!$pagoId) {
    echo "No class found.\n";
    exit;
}
$pago = App\Models\Pago::with('tiposCredito')->find($pagoId);
echo "Original pago id: $pagoId\n";
echo "Original tipo_clase: {$pago->tipo_clase}\n";
echo "Original centro: {$pago->centro}\n";

$allowedCreditTypeIds = $pago->tiposCredito->pluck('id')->toArray();
echo "Allowed credits: " . implode(',', $allowedCreditTypeIds) . "\n";

$now = now();
$futurePagosQuery = App\Models\Pago::with(['user', 'entrenadores', 'tiposCredito'])
    ->where('fecha_registro', '>', $now)
    ->where('centro', $pago->centro)
    ->where('tipo_clase', $pago->tipo_clase);

echo "Total future pagos same tipo_clase & centro: " . $futurePagosQuery->count() . "\n";

$futurePagosQuery = clone $futurePagosQuery;
$futurePagos = $futurePagosQuery->whereHas('tiposCredito', function($q) use ($allowedCreditTypeIds) {
        $q->whereIn('tipo_credito_id', $allowedCreditTypeIds);
    })->get();

echo "After tiposCredito filter: " . $futurePagos->count() . " records.\n";

$grouped = $futurePagos->groupBy(function($p) {
    return $p->fecha_registro->format('Y-m-d H:i:s') . '|' . $p->nombre_clase . '|' . $p->centro;
});

echo "Unique future sessions: " . $grouped->count() . "\n";

foreach ($grouped as $key => $pagos) {
    echo "Checking candidate: $key\n";
    $first = $pagos->first();

    if ($first->fecha_registro->eq($pago->fecha_registro) && 
        $first->nombre_clase === $pago->nombre_clase && 
        $first->centro === $pago->centro) {
        echo "  - Skipped: Is the original session.\n";
        continue;
    }

    $count = $pagos->filter(fn($p) => $p->user_id !== null)->count();
    $capacidad = $first->capacidad_maxima ?? 0;
    
    echo "  - Capacidad: $capacidad, Count: $count\n";
}
