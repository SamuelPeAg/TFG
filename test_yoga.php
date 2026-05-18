<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pagoId = App\Models\Pago::where('nombre_clase', 'Yoga Flow')->whereNotNull('user_id')->first()->id ?? null;
if (!$pagoId) {
    echo "No Yoga Flow pago found.\n";
    exit;
}

$user = App\Models\User::find(App\Models\Pago::find($pagoId)->user_id);
Illuminate\Support\Facades\Auth::login($user);

$request = Illuminate\Http\Request::create('/booking-swap/' . $pagoId . '/candidates', 'GET');

$controller = new App\Http\Controllers\BookingSwapController();
try {
    $response = $controller->getCandidates($request, App\Models\Pago::find($pagoId));
    echo "Response status: " . $response->getStatusCode() . "\n";
    if ($response->getStatusCode() !== 200) {
        echo "Content: " . $response->getContent() . "\n";
    } else {
        echo "Success\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
