<?php
// Cargar Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\Pago;
use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "--- DIAGNOSTICO ENTRENADORES ---\n";

// 1. Verificar últimos pagos
$ultimosPagos = Pago::orderBy('id', 'desc')->take(5)->with('entrenadores')->get();

foreach($ultimosPagos as $p) {
    echo "Pago ID: {$p->id} | Clase: {$p->nombre_clase} | Fecha: {$p->fecha_registro}\n";
    echo " -> Entrenadores count (relación): " . $p->entrenadores->count() . "\n";
    foreach($p->entrenadores as $e) {
        echo "    - ID: {$e->id} Name: {$e->name}\n";
    }
}

// 2. Verificar tabla pivote directamente
$pivoteCount = DB::table('pago_entrenador')->count();
echo "\nTotal registros en pago_entrenador: $pivoteCount\n";

if ($pivoteCount > 0) {
    $lastPivot = DB::table('pago_entrenador')->orderBy('id', 'desc')->take(5)->get();
    echo "Últimos 5 registros en pivote:\n";
    foreach($lastPivot as $row) {
        echo " - ID: {$row->id} | PagoID: {$row->pago_id} | UserID: {$row->user_id}\n";
    }
} 

echo "--- FIN DIAGNOSTICO ---\n";
