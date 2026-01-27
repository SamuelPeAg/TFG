<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\AuthPasswordController;

use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\FacturacionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PagosController;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

// Legales
Route::view('/aviso-legal', 'legal.notice')->name('legal.notice');
Route::view('/politica-privacidad', 'legal.privacy')->name('privacy.policy');
Route::view('/politica-cookies', 'legal.cookies')->name('cookies.policy');
Route::view('/contacto', 'contact')->name('contact');

// Contacto (POST)
Route::post('/contacto/enviar', function (Request $request) {
    $validated = $request->validate([
        'name'    => 'required|string|max:255',
        'email'   => 'required|email|max:255',
        'phone'   => 'nullable|string|max:20',
        'message' => 'required|string|max:1000',
    ]);

    return redirect()->route('contact')
        ->with('success', '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.');
})->name('contact.send');

// Activación entrenador (público)
Route::get('/activar-entrenador/{token}', [EntrenadorController::class, 'activarEntrenador'])
    ->name('entrenadores.activar');

Route::put('/activar-entrenador-complete/{id}', [EntrenadorController::class, 'completeActivation'])
    ->name('entrenadores.complete');


/*
|--------------------------------------------------------------------------
| RUTAS GUEST (solo si NO estás logueado)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return view('login.signup.login');
    })->name('login');

    Route::post('/login', [LoginController::class, 'login']);

    Route::get('/register', [RegisterController::class, 'show'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});


/*
|--------------------------------------------------------------------------
| PASSWORD RESET (NO requiere login)
|--------------------------------------------------------------------------
*/
Route::get('/forgot-password', [AuthPasswordController::class, 'forgotForm'])->name('password.request');
Route::post('/forgot-password', [AuthPasswordController::class, 'sendReset'])->name('password.email');

Route::get('/reset-password/{token}', [AuthPasswordController::class, 'resetForm'])->name('password.reset');
Route::post('/reset-password', [AuthPasswordController::class, 'updatePassword'])->name('password.update');


/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS (requiere login)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // Logout
    Route::post('/logout', function () {
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');

    /*
    |--------------------------------------------------------------------------
    | ADMIN O ENTRENADOR
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class)->group(function () {

        // Calendario
        Route::get('/calendario', [CalendarioController::class, 'index'])
            ->name('calendario');

        // Facturas (si también deben verlas admin/entrenador; si no, mueve a Admin)
        Route::get('/facturas', [FacturacionController::class, 'index'])->name('facturas');
        Route::get('/facturas/clases', [FacturacionController::class, 'clases'])->name('facturas.clases');

        // Pagos (acciones que usan admin y entrenador)
        Route::post('/Pagos', [PagosController::class, 'store'])
            ->name('Pagos.store');

        Route::get('/usuarios/Pagos', [PagosController::class, 'buscarPorUsuario'])
            ->name('Pagos.buscar');

        Route::post('/Pagos/add-trainer', [PagosController::class, 'addTrainerToSession'])
            ->name('Pagos.addTrainer');

        Route::post('/Pagos/remove-trainer', [PagosController::class, 'removeTrainerFromSession'])
            ->name('Pagos.removeTrainer');

        // Users (admin o entrenador)
        Route::resource('users', UserController::class);

        Route::post('/users/crear-grupo', [UserController::class, 'storeGroup'])
            ->name('users.group.store');

        Route::delete('/users/grupos/{id}', [UserController::class, 'destroyGroup'])
            ->name('users.group.destroy');

        // Configuración (NO fuera del auth)
        Route::get('/configuracion', [UserController::class, 'configuracion'])->name('configuracion.edit');
        Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])->name('configuracion.update');
    });

    /*
    |--------------------------------------------------------------------------
    | SOLO ADMIN
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {

        // Pagos index (solo admin)
        Route::get('/Pagos', [PagosController::class, 'index'])->name('Pagos');

        // Reporte pagos (solo admin)
        Route::get('/Pagos/reporte', [PagosController::class, 'getReporte'])->name('Pagos.reporte');

        // Gestión entrenadores (solo admin)
        Route::resource('entrenadores', EntrenadorController::class);
    });
});
