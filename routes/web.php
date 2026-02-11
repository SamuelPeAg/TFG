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
use App\Http\Controllers\NominaEntrenadorController;
use App\Http\Controllers\PagosController;
use App\Http\Controllers\NominaAdminController;

/*
|--------------------------------------------------------------------------
| 1. RUTAS PÚBLICAS
|--------------------------------------------------------------------------
*/

// Home
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

// Legales
Route::view('/aviso-legal', 'legal.notice')->name('legal.notice');
Route::view('/politica-privacidad', 'legal.privacy')->name('privacy.policy');
Route::view('/politica-cookies', 'legal.cookies')->name('cookies.policy');
Route::get('/contacto', function () {
    $centros = \App\Models\Centro::all();
    return view('contact', compact('centros'));
})->name('contact');

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

// Activación entrenador
Route::get('/activar-entrenador/{token}', [EntrenadorController::class, 'activarEntrenador'])
    ->name('entrenadores.activar');

Route::put('/activar-entrenador-complete/{id}', [EntrenadorController::class, 'completeActivation'])
    ->name('entrenadores.complete');


/*
|--------------------------------------------------------------------------
| 2. AUTENTICACIÓN (GUEST)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    // Login
    Route::get('/login', function () {
        return view('login.signup.login');
    })->name('login');
    Route::post('/login', [LoginController::class, 'login']);

    // Registro
    Route::get('/register', [RegisterController::class, 'show'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);

    // Recuperación de Contraseña
    Route::get('/forgot-password', [AuthPasswordController::class, 'forgotForm'])->name('password.request');
    Route::post('/forgot-password', [AuthPasswordController::class, 'sendReset'])->name('password.email');
    Route::get('/reset-password/{token}', [AuthPasswordController::class, 'resetForm'])->name('password.reset');
    Route::post('/reset-password', [AuthPasswordController::class, 'updatePassword'])->name('password.update');
});


/*
|--------------------------------------------------------------------------
| 3. RUTAS PROTEGIDAS (AUTH)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // Logout
    Route::post('/logout', function () {
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');

    // --- NÓMINAS ENTRENADOR (Ruta Mixta/Entrenador) ---
    Route::get('/mis-nominas', [NominaEntrenadorController::class, 'index'])->name('nominas_e');
    Route::get('/mis-nominas/{id}/descargar', [NominaEntrenadorController::class, 'descargar'])->name('nominas_e.descargar');

    // --- PDF NÓMINAS (Preview & Download dinámico) ---
    Route::get('/nominas/{id}/preview', [\App\Http\Controllers\NominaPdfController::class, 'preview'])->name('nominas.preview');
    Route::get('/nominas/{id}/download', [\App\Http\Controllers\NominaPdfController::class, 'download'])->name('nominas.download');


    /*
    |--------------------------------------------------------------------------
    | 3.1 COMPARTIDO (ADMIN & ENTRENADOR)
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class)->group(function () {

        // Calendario (Vista principal)
        Route::get('/calendario', [CalendarioController::class, 'index'])
            ->name('calendario'); // Revertido para evitar error RouteNotFoundException

        // Gestión de Pagos / Clases (Acciones del Calendario)
        Route::post('/Pagos', [PagosController::class, 'store'])->name('Pagos.store');
        Route::get('/usuarios/Pagos', [PagosController::class, 'buscarPorUsuario'])->name('Pagos.buscar');
        Route::post('/Pagos/add-trainer', [PagosController::class, 'addTrainerToSession'])->name('Pagos.addTrainer');
        Route::post('/Pagos/remove-trainer', [PagosController::class, 'removeTrainerFromSession'])->name('Pagos.removeTrainer');
        Route::post('/Pagos/add-client', [PagosController::class, 'addClientToSession'])->name('Pagos.addClient');
        Route::post('/Pagos/remove-client', [PagosController::class, 'removeClientFromSession'])->name('Pagos.removeClient');

        // Facturación
        Route::get('/facturas', [FacturacionController::class, 'index'])->name('facturas');
        Route::get('/facturas/clases', [FacturacionController::class, 'clases'])->name('facturas.clases');

        // Usuarios (Resource)
        Route::resource('users', UserController::class);

        // Configuración de Perfil
        Route::get('/configuracion', [UserController::class, 'configuracion'])->name('configuracion.edit');
        Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])->name('configuracion.update');

        /* RUTAS DE GRUPOS (DESHABILITADAS TEMPORALMENTE)
        Route::post('/users/crear-grupo', [UserController::class, 'storeGroup'])->name('users.group.store');
        Route::delete('/users/grupos/{id}', [UserController::class, 'destroyGroup'])->name('users.group.destroy');
        */
    });

    /*
    |--------------------------------------------------------------------------
    | 3.2 SOLO ADMINISTRADOR
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {

        // Gestión de Entrenadores
        Route::resource('entrenadores', EntrenadorController::class);

        // Acciones Avanzadas de Pagos (Solo Admin)
        Route::get('/Pagos', [PagosController::class, 'index'])->name('Pagos.index'); // Listado completo
        Route::get('/Pagos/reporte', [PagosController::class, 'getReporte'])->name('Pagos.reporte');
        Route::post('/Pagos/delete-session', [PagosController::class, 'deleteSession'])->name('Pagos.deleteSession');

        // Gestión entrenadores (solo admin)
        // Gestión entrenadores (solo admin)
        Route::resource('entrenadores', EntrenadorController::class);

        // --- NÓMINAS (Admin) ---
        Route::get('/admin/nominas', [NominaAdminController::class, 'index'])->name('admin.nominas');
        Route::post('/admin/nominas/generar', [NominaAdminController::class, 'generar'])->name('admin.nominas.generar');
        Route::put('/admin/nominas/{id}', [NominaAdminController::class, 'update'])->name('admin.nominas.update');
        Route::post('/admin/nominas/{id}/pagar', [NominaAdminController::class, 'marcarPagado'])->name('admin.nominas.pagar');
        Route::delete('/admin/nominas/{id}', [NominaAdminController::class, 'destroy'])->name('admin.nominas.destroy');
        Route::get('/admin/nominas/calcular/{user_id}', [NominaAdminController::class, 'calcularNomina'])->name('admin.nominas.calcular');
    });

});
