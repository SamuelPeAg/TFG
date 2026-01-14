<?php

use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\FacturacionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserReservationController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\SessionesController;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS (Cualquiera puede entrar)
|--------------------------------------------------------------------------
*/
Route::get('/reservar', [UserReservationController::class, 'index'])->name('booking.view');
Route::post('/reservar/guardar', [UserReservationController::class, 'store'])->name('sesiones.reservar');
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

// La gestión de entrenadores debe requerir autenticación y rol admin (se añadirá en el grupo auth más abajo)

// Las rutas de gestión de usuarios deben estar protegidas (ver sección auth)

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

    Route::post('/logout', function () {
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');

    Route::get('/facturas', [FacturacionController::class, 'index'])
        ->name('facturas');
    // 1. Ver la lista de sesiones
    Route::get('/sesiones', [SessionesController::class, 'index'])->name('sesiones');
    Route::post('/sesiones', [SessionesController::class, 'store'])->name('sesiones.store');

    // Buscador
    Route::get('/usuarios/reservas', [SessionesController::class, 'buscarPorUsuario'])->name('sesiones.buscar');
    
   // Ejemplo en web.php
    // Gestión de usuarios para admin o entrenador
    Route::resource('users', UserController::class)->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::post('/users/crear-grupo', [UserController::class, 'storeGroup'])->name('users.group.store')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::delete('/users/grupos/{id}', [UserController::class, 'destroyGroup'])->name('users.group.destroy')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    // Gestión de entrenadores (solo admin)
    Route::resource('entrenadores', EntrenadorController::class)->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::resource('reservations', UserReservationController::class); // Agregué esto por si acaso
    
    Route::get('/configuracion', [UserController::class, 'configuracion'])->name('configuracion.edit');
    Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])->name('configuracion.update');

    Route::get('/calendario', function () {
        return view('booking.calendar'); 
    })->name('booking.view');
});