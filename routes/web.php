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
use App\Http\Controllers\ClientProfileController;

/*
|--------------------------------------------------------------------------
| 1. RUTAS PÚBLICAS (React)
|--------------------------------------------------------------------------
*/

// Todas las rutas públicas van a la app de React
Route::get('/', function () {
    return view('app');
})->name('welcome');

// React handles its own auth routing natively via react-router
Route::get('/login', function () {
    return view('app');
})->name('login');

Route::get('/register', function () {
    return view('app');
})->name('register');

Route::get('/forgot-password', function () {
    return view('app');
})->name('password.request');

Route::get('/reset-password', function () {
    return view('app');
})->name('password.reset');

Route::get('/aviso-legal', function () {
    return view('app');
})->name('legal.notice');

Route::get('/politica-privacidad', function () {
    return view('app');
})->name('privacy.policy');

Route::get('/politica-cookies', function () {
    return view('app');
})->name('cookies.policy');

Route::get('/contacto', function () {
    return view('app');
})->name('contact');

// Contacto (POST) - Devuelve JSON para axios
Route::post('/contacto/enviar', function (Request $request) {
    $validated = $request->validate([
        'name'    => 'required|string|max:255',
        'email'   => 'required|email|max:255',
        'phone'   => 'nullable|string|max:20',
        'message' => 'required|string|max:1000',
    ]);

    // Aquí iría la lógica de envío de email o guardar en BD
    return response()->json([
        'success' => true,
        'message' => '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.'
    ]);
})->name('contact.send');



Route::get('/activar-entrenador/{token}', [EntrenadorController::class, 'showActivationForm'])
    ->name('entrenadores.activar');
Route::put('/activar-entrenador-complete/{id}', [EntrenadorController::class, 'completeActivation'])
    ->name('entrenadores.complete');


/*
|--------------------------------------------------------------------------
| 2. AUTENTICACIÓN (GUEST) - REACT ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware(['guest', 'throttle:6,1'])->group(function () {
    // API endpoints para autenticación (solo POST)
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/forgot-password', [AuthPasswordController::class, 'sendReset'])->name('password.email');
    Route::post('/reset-password', [AuthPasswordController::class, 'updatePassword'])->name('password.update');
});


/*
|--------------------------------------------------------------------------
| 3. RUTAS PROTEGIDAS (AUTH)
|--------------------------------------------------------------------------
*/
Route::get('/activate-account/{token}', [UserController::class, 'showActivationForm'])->name('activate.show');
Route::post('/activate-account/{token}', [UserController::class, 'activate'])->name('activate.process');

Route::middleware('auth:web,staff')->group(function () {

    // Logout
    Route::post('/logout', function () {
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');

    // Logout via GET para forzar cierre de sesión manualmente en pruebas
    Route::get('/logout-get', function () {
        \Illuminate\Support\Facades\Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    });

    // --- NÓMINAS ENTRENADOR (Ruta Mixta/Entrenador) ---
    Route::get('/mis-nominas', [NominaEntrenadorController::class, 'index'])->name('nominas_e');
    Route::get('/mis-nominas/{id}/descargar', [NominaEntrenadorController::class, 'descargar'])->name('nominas_e.descargar');

    // --- PDF NÓMINAS (Preview & Download dinámico) ---
    Route::get('/nominas/{id}/preview', [\App\Http\Controllers\NominaPdfController::class, 'preview'])->name('nominas.preview');
    Route::get('/nominas/{id}/download', [\App\Http\Controllers\NominaPdfController::class, 'download'])->name('nominas.download');

    // Descarga de archivos de cliente (Visible para dueño del archivo o staff)
    Route::get('/client-file/{file}/download', [ClientProfileController::class, 'downloadFile'])->name('client-file.download');


    // Calendario (Vista principal) para todos los usuarios autenticados
    Route::get('/calendario', [CalendarioController::class, 'index'])->name('calendario');

    // Gestión de Pagos / Clases (Acciones del Calendario) para todos los usuarios autenticados
    Route::post('/Pagos', [PagosController::class, 'store'])->name('Pagos.store');
    Route::get('/usuarios/Pagos', [PagosController::class, 'buscarPorUsuario'])->name('Pagos.buscar');
    Route::post('/Pagos/add-trainer', [PagosController::class, 'addTrainerToSession'])->name('Pagos.addTrainer');
    Route::post('/Pagos/remove-trainer', [PagosController::class, 'removeTrainerFromSession'])->name('Pagos.removeTrainer');
    Route::post('/Pagos/add-client', [PagosController::class, 'addClientToSession'])->name('Pagos.addClient');
    Route::post('/Pagos/remove-client', [PagosController::class, 'removeClientFromSession'])->name('Pagos.removeClient');

    // Configuración de Perfil (Para TODOS los usuarios)
    Route::get('/configuracion', [UserController::class, 'configuracion'])->name('configuracion.edit');
    Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])->name('configuracion.update');

    // Perfil de Cliente (Lectura propia para clientes, total para staff)
    Route::get('/client-profile/{user}', [ClientProfileController::class, 'show']);
    Route::get('/client-profile/{user}/statistics', [ClientProfileController::class, 'statistics']);
    Route::put('/client-profile/{user}', [ClientProfileController::class, 'update']);
    Route::post('/client-profile/{user}/upload', [ClientProfileController::class, 'uploadFile']);
    Route::post('/client-profile/{user}/progress', [ClientProfileController::class, 'saveProgress']);
    Route::put('/measurements/{measurement}', [ClientProfileController::class, 'updateMeasurement']);
    Route::delete('/measurements/{measurement}', [ClientProfileController::class, 'deleteMeasurement']);


    /*
    |--------------------------------------------------------------------------
    | 3.1 COMPARTIDO (ADMIN & ENTRENADOR)
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class)->group(function () {

        // Listas para POS (Shared)
        Route::prefix('api')->group(function () {
            Route::get('/empresas-list', function() {
                return \App\Models\Empresa::all();
            });
            Route::get('/centros-list', function() {
                return \App\Models\Centro::all();
            });
        });

        // Movido arriba

        // Facturación
        Route::get('/facturas', [FacturacionController::class, 'index'])->name('facturas');
        Route::get('/facturas/clases', [FacturacionController::class, 'clases'])->name('facturas.clases');
        Route::get('/facturas/export-xml', [FacturacionController::class, 'exportXML'])->name('facturas.export_xml');
        Route::post('/facturas/tickar', [FacturacionController::class, 'tickar'])->name('facturas.tickar');
        Route::get('/facturas/{id}/pdf', [FacturacionController::class, 'downloadFacturaPdf'])->name('facturas.pdf');

        // Notificaciones de Entrenadores (Enviar y Ver Propias)
        Route::post('/notificaciones-entrenador', [\App\Http\Controllers\NotificacionEntrenadorController::class, 'store'])->name('notificaciones_entrenador.store');
        Route::get('/notificaciones-entrenador', [\App\Http\Controllers\NotificacionEntrenadorController::class, 'myNotifications']);
        Route::get('/api/entrenadores-list', [\App\Http\Controllers\NotificacionEntrenadorController::class, 'getEntrenadores']);

        // Suscripciones
        Route::get('/suscripciones', [\App\Http\Controllers\SuscripcionController::class, 'index'])->name('suscripciones.index');
        Route::post('/suscripciones', [\App\Http\Controllers\SuscripcionController::class, 'store'])->name('suscripciones.store');
        Route::put('/suscripciones/{id}', [\App\Http\Controllers\SuscripcionController::class, 'update'])->name('suscripciones.update');
        Route::delete('/suscripciones/{id}', [\App\Http\Controllers\SuscripcionController::class, 'destroy'])->name('suscripciones.destroy');

        // Suscripciones de Usuarios
        Route::post('/suscripciones-usuarios', [\App\Http\Controllers\SuscripcionUsuarioController::class, 'store'])->name('suscripciones_usuarios.store');
        Route::put('/suscripciones-usuarios/{id}', [\App\Http\Controllers\SuscripcionUsuarioController::class, 'update'])->name('suscripciones_usuarios.update');
        Route::delete('/suscripciones-usuarios/{id}', [\App\Http\Controllers\SuscripcionUsuarioController::class, 'destroy'])->name('suscripciones_usuarios.destroy');
        Route::post('/suscripciones-usuarios/{id}/ajustar-saldo', [\App\Http\Controllers\SuscripcionUsuarioController::class, 'ajustarSaldo'])->name('suscripciones_usuarios.ajustar_saldo');
        Route::post('/suscripciones-usuarios/{id}/confirmar-pago', [\App\Http\Controllers\SuscripcionUsuarioController::class, 'confirmarPago'])->name('suscripciones_usuarios.confirmar_pago');

        // Usuarios (Resource & React view)
        Route::get('/clientes', [UserController::class, 'index'])->name('clientes.index');
        Route::resource('users', UserController::class);

        Route::post('/users/import', [UserController::class, 'importClients'])->name('users.import');
        Route::post('/users/{user}/send-activation', [UserController::class, 'sendActivation'])->name('users.send-activation');
        Route::post('/users/bulk-send-activation', [UserController::class, 'bulkSendActivation'])->name('users.bulk-send-activation');

        // Ficha de Cliente y Archivos (Historia Clínica / Notas) - Escritura y gestión de archivos solo staff
        Route::prefix('client-profile')->group(function() {
            Route::post('/file/{file}/toggle-privacy', [ClientProfileController::class, 'toggleFilePrivacy']);
            Route::delete('/file/{file}', [ClientProfileController::class, 'deleteFile']);
        });

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
        
        // Vista de Estadísticas
        Route::get('/estadisticas', [\App\Http\Controllers\EstadisticasController::class, 'index'])->name('estadisticas.index');

        // Rutas de Datos / Gestión API
        Route::prefix('api')->group(function () {
            // Datos de Estadísticas
            Route::get('/estadisticas', [\App\Http\Controllers\EstadisticasController::class, 'data'])->name('api.estadisticas.data');
            
            // Gestión de Empresas
            Route::post('/admin/empresas', [\App\Http\Controllers\EstadisticasController::class, 'storeEmpresa']);
            Route::put('/admin/empresas/{empresa}', [\App\Http\Controllers\EstadisticasController::class, 'updateEmpresa']);
            Route::delete('/admin/empresas/{empresa}', [\App\Http\Controllers\EstadisticasController::class, 'destroyEmpresa']);

            // Gestión de Centros
            Route::post('/admin/centros', [\App\Http\Controllers\EstadisticasController::class, 'storeCentro']);
            Route::put('/admin/centros/{centro}', [\App\Http\Controllers\EstadisticasController::class, 'updateCentro']);
            Route::delete('/admin/centros/{centro}', [\App\Http\Controllers\EstadisticasController::class, 'destroyCentro']);

            // Gestión de Tipos de Sesión
            Route::get('/admin/tipos-sesion', [\App\Http\Controllers\EstadisticasController::class, 'indexTiposSesion']);
            Route::post('/admin/tipos-sesion', [\App\Http\Controllers\EstadisticasController::class, 'storeTipoSesion']);
            Route::put('/admin/tipos-sesion/{tipoSesion}', [\App\Http\Controllers\EstadisticasController::class, 'updateTipoSesion']);
            Route::delete('/admin/tipos-sesion/{tipoSesion}', [\App\Http\Controllers\EstadisticasController::class, 'destroyTipoSesion']);

            // Gestión de Notificaciones (Admin)
            Route::get('/admin/notificaciones', [\App\Http\Controllers\NotificacionEntrenadorController::class, 'index']);
            Route::post('/admin/notificaciones/{id}/read', [\App\Http\Controllers\NotificacionEntrenadorController::class, 'markAsRead']);
            Route::post('/admin/notificaciones/{id}/reply', [\App\Http\Controllers\NotificacionEntrenadorController::class, 'reply']);
            Route::delete('/admin/notificaciones/{id}', [\App\Http\Controllers\NotificacionEntrenadorController::class, 'destroy']);
        });

        // Gestión de Entrenadores
        Route::resource('entrenadores', EntrenadorController::class);

        // Acciones Avanzadas de Pagos (Solo Admin)
        Route::get('/Pagos/reporte', [PagosController::class, 'getReporte'])->name('Pagos.reporte');
        Route::post('/Pagos/delete-session', [PagosController::class, 'deleteSession'])->name('Pagos.deleteSession');
        Route::post('/Pagos/update-session', [PagosController::class, 'updateSession'])->name('Pagos.updateSession');
        
        // Operaciones individuales de Pagos
        Route::delete('/pagos/{pago}', [PagosController::class, 'destroySingle'])->name('pagos.destroy_single');
        Route::put('/pagos/{pago}', [PagosController::class, 'updateSingle'])->name('pagos.update_single');

        // Gestión entrenadores (solo admin)
        // Gestión entrenadores (solo admin)
        Route::resource('entrenadores', EntrenadorController::class);
        Route::get('/entrenadores/{id}/permissions', [EntrenadorController::class, 'getPermissions']);
        Route::post('/entrenadores/{id}/permissions', [EntrenadorController::class, 'syncPermissions']);

        // --- NÓMINAS (Admin) ---
        Route::get('/admin/nominas', [NominaAdminController::class, 'index'])->name('admin.nominas');
        Route::post('/admin/nominas/generar', [NominaAdminController::class, 'generar'])->name('admin.nominas.generar');
        Route::put('/admin/nominas/{id}', [NominaAdminController::class, 'update'])->name('admin.nominas.update');
        Route::post('/admin/nominas/{id}/pagar', [NominaAdminController::class, 'marcarPagado'])->name('admin.nominas.pagar');
        Route::delete('/admin/nominas/{id}', [NominaAdminController::class, 'destroy'])->name('admin.nominas.destroy');
        Route::get('/admin/nominas/calcular/{user_id}', [NominaAdminController::class, 'calcularNomina'])->name('admin.nominas.calcular');
    });

});

// Fallback para React Router (SPA)
Route::fallback(function () {
    return view('app');
});
