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
use App\Http\Controllers\SuscripcionController;
use App\Http\Controllers\SuscripcionUsuarioController;
use App\Http\Controllers\ClienteController;

/*
|--------------------------------------------------------------------------
| 1. RUTAS PÚBLICAS
|--------------------------------------------------------------------------
*/

// Ruta para renovar token CSRF desde el login
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf-token');

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
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'phone' => 'nullable|string|max:20',
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
Route::middleware('auth:web,entrenador')->group(function () {

    // Logout
    Route::post('/logout', function () {
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');

    // Configuración de Perfil (Acceso General)
    Route::get('/configuracion', [UserController::class, 'configuracion'])->name('configuracion.edit');
    Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])->name('configuracion.update');

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
            ->name('calendario');

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
        Route::get('/facturas/export-xml', [FacturacionController::class, 'exportXML'])->name('facturas.export_xml');
        Route::post('/facturas/tickar', [FacturacionController::class, 'tickar'])->name('facturas.tickar');

        // Usuarios (Resource)
        Route::resource('users', UserController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | 3.2 SOLO ADMINISTRADOR
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {

        // Gestión de Entrenadores
        Route::resource('entrenadores', EntrenadorController::class);
        Route::post('/admin/centros', [\App\Http\Controllers\Admin\CentroManagementController::class, 'store'])->name('admin.centros.store');

        // Acciones Avanzadas de Pagos (Solo Admin)
        Route::get('/Pagos', [PagosController::class, 'index'])->name('Pagos.index');
        Route::get('/Pagos/reporte', [PagosController::class, 'getReporte'])->name('Pagos.reporte');
        Route::post('/Pagos/delete-session', [PagosController::class, 'deleteSession'])->name('Pagos.deleteSession');

        // --- NÓMINAS (Admin) ---
        Route::get('/admin/nominas', [NominaAdminController::class, 'index'])->name('admin.nominas');
        Route::post('/admin/nominas/generar', [NominaAdminController::class, 'generar'])->name('admin.nominas.generar');
        Route::put('/admin/nominas/{id}', [NominaAdminController::class, 'update'])->name('admin.nominas.update');
        Route::post('/admin/nominas/{id}/pagar', [NominaAdminController::class, 'marcarPagado'])->name('admin.nominas.pagar');
        Route::delete('/admin/nominas/{id}', [NominaAdminController::class, 'destroy'])->name('admin.nominas.destroy');
        Route::get('/admin/nominas/calcular/{user_id}', [NominaAdminController::class, 'calcularNomina'])->name('admin.nominas.calcular');

        // --- ESTADÍSTICAS (Admin) ---
        Route::get('/admin/estadisticas', [\App\Http\Controllers\AdminEstadisticasController::class, 'index'])->name('admin.estadisticas');
        // --- SISTEMA DE CRÉDITOS Y SUSCRIPCIONES ---
        Route::resource('suscripciones', SuscripcionController::class);
        Route::post('/suscripciones-usuarios', [SuscripcionUsuarioController::class, 'store'])->name('suscripciones-usuarios.store');
        Route::put('/suscripciones-usuarios/{id}', [SuscripcionUsuarioController::class, 'update'])->name('suscripciones-usuarios.update');
        Route::delete('/suscripciones-usuarios/{id}', [SuscripcionUsuarioController::class, 'destroy'])->name('suscripciones-usuarios.destroy');
        Route::post('/suscripciones-usuarios/{id}/ajustar', [SuscripcionUsuarioController::class, 'ajustarSaldo'])->name('suscripciones-usuarios.ajustar');
    });

    // --- RUTAS DE CLIENTE ---
    Route::middleware([\App\Http\Middleware\CheckRole::class . ':cliente'])->group(function () {
        Route::get('/mis-clases', [ClienteController::class, 'index'])->name('cliente.dashboard');
        Route::post('/reservar-clase', [ClienteController::class, 'reservar'])->name('cliente.reservar');
        Route::post('/abandonar-clase', [ClienteController::class, 'abandonar'])->name('cliente.abandonar');
        Route::get('/api/clases', [ClienteController::class, 'apiClases'])->name('cliente.api.clases');
    });

});
