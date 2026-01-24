<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PagosController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\FacturacionController;
// Importante: Tu controlador de nóminas
use App\Http\Controllers\NominaAdminController;
use App\Http\Controllers\NominaEntrenadorController;


/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS (Cualquiera puede entrar)
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

// Activación de cuenta
Route::get('/activar-entrenador/{token}', [EntrenadorController::class, 'activarEntrenador'])->name('entrenadores.activar');

// Rutas Legales
Route::get('/aviso-legal', function () { return view('legal.notice'); })->name('legal.notice');
Route::get('/politica-privacidad', function () { return view('legal.privacy'); })->name('privacy.policy');
Route::get('/politica-cookies', function () { return view('legal.cookies'); })->name('cookies.policy');
Route::get('/contacto', function () { return view('contact'); })->name('contact');


/*
|--------------------------------------------------------------------------
| RUTAS GUEST (Solo si NO estás logueado)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', function () { return view('login.signup.login'); })->name('login'); 
    Route::post("/login", [LoginController::class, "login"]);

    Route::get('/register', [RegisterController::class, 'show'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});


/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS (Requiere Login)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', \App\Http\Middleware\RestrictEntrenadorMiddleware::class])->group(function () {

    // --- LOGOUT ---
    Route::post('/logout', function () {
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');

    // --- FACTURAS Y PAGOS ---
    Route::get('/facturas', [FacturacionController::class, 'index'])->name('facturas');
    
    Route::get('/Pagos', [PagosController::class, 'index'])->name('Pagos')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::post('/Pagos', [PagosController::class, 'store'])->name('Pagos.store')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::get('/usuarios/Pagos', [PagosController::class, 'buscarPorUsuario'])->name('Pagos.buscar')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    
    // --- GESTIÓN DE USUARIOS (Admin o Entrenador) ---
    Route::resource('users', UserController::class)->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::post('/users/crear-grupo', [UserController::class, 'storeGroup'])->name('users.group.store')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::delete('/users/grupos/{id}', [UserController::class, 'destroyGroup'])->name('users.group.destroy')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    
    // --- GESTIÓN DE ENTRENADORES (Solo Admin) ---
    Route::resource('entrenadores', EntrenadorController::class)->middleware(\App\Http\Middleware\AdminMiddleware::class);
    
    // --- NÓMINAS ---
    
    // 1. Para el ENTRENADOR (Ver sus propias nóminas)
    // Usa el controlador que acabamos de arreglar
    Route::get('/mis-nominas', [NominaEntrenadorController::class, 'index'])
         ->name('nominas_e');

    // 2. Para el ADMIN (Ver panel de nóminas general)
    // ¡IMPORTANTE! Le he añadido el middleware de Admin para seguridad
    Route::get('/admin/nominas', function () {
        return view('nominas_admin.nominas_a'); 
    })->name('admin.nominas')->middleware(\App\Http\Middleware\AdminMiddleware::class);


    // --- CALENDARIO ---
    Route::get('/calendario', function () {
        return view('booking.calendar'); 
    })->name('booking.view');

}); // Fin del grupo AUTH


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DE USUARIO (Fuera del grupo principal, con su propio middleware)
|--------------------------------------------------------------------------
*/
Route::get('/configuracion', [UserController::class, 'configuracion'])
    ->name('configuracion.edit')
    ->middleware(['auth', \App\Http\Middleware\AdminOrEntrenadorMiddleware::class]);

Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])
    ->name('configuracion.update')
    ->middleware(['auth', \App\Http\Middleware\AdminOrEntrenadorMiddleware::class]);

    Route::get('/mis-nominas', [NominaEntrenadorController::class, 'index'])
     ->name('nominas_e');


Route::get('/mis-nominas/{id}/descargar', [NominaEntrenadorController::class, 'descargar'])
     ->name('nominas_e.descargar');
     
     // --- GESTIÓN DE NÓMINAS (ADMINISTRADOR) ---
Route::middleware(['auth', \App\Http\Middleware\AdminMiddleware::class])->group(function () {

    // 1. Ver el panel (GET)
    Route::get('/admin/nominas', [NominaAdminController::class, 'index'])
         ->name('admin.nominas');

    // 2. Guardar/Subir nómina (POST)
    // Esta es la ruta que usa tu formulario: action="{{ route('admin.nominas.store') }}"
    Route::post('/admin/nominas', [NominaAdminController::class, 'store'])
         ->name('admin.nominas.store');

    // 3. Eliminar nómina (DELETE)
    // Esta es la ruta que usa el botón de basura
    Route::delete('/admin/nominas/{id}', [NominaAdminController::class, 'destroy'])
         ->name('admin.nominas.destroy');

});