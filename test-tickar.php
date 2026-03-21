<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create(
    '/facturas/tickar',
    'POST',
    [],
    [],
    [],
    ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json'],
    json_encode([
        'cliente_id' => 1,
        'entrenador_id' => 1,
        'centro' => 'Open Arena',
        'importe_entregado' => 40.0,
        'items' => [['tipo' => 'Trio', 'precio' => 28.5, 'is_abono' => false]]
    ])
);

// We need DB access
try {
    $ctrl = $app->make(App\Http\Controllers\FacturacionController::class);
    $response = $ctrl->tickar($request);
    echo $response->getContent();
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "Validation failed: \n";
    print_r($e->errors());
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
