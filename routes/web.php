<?php

use App\Http\Controllers\EntrenadorController;
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

Route::resource('entrenadores', EntrenadorController::class);

Route::resource('users', UserController::class);
Route::post('/users/crear-grupo', [UserController::class, 'storeGroup'])->name('users.group.store');
Route::delete('/users/grupos/{id}', [UserController::class, 'destroyGroup'])->name('users.group.destroy');

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
Route::middleware('auth')->group(function () {

    Route::post('/logout', function () {
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');


    // 1. Ver la lista de sesiones
    Route::get('/sesiones', [SessionesController::class, 'index'])->name('sesiones');
    Route::post('/sesiones', [SessionesController::class, 'store'])->name('sesiones.store');

    // Buscador
    Route::get('/usuarios/reservas', [SessionesController::class, 'buscarPorUsuario'])->name('sesiones.buscar');

    // --- OTRAS RUTAS ---
    Route::resource('users', UserController::class);
    // Route::resource('trainers', TrainerController::class);
   // Ejemplo en web.php
    Route::resource('reservations', UserReservationController::class); // Agregué esto por si acaso
    
    Route::view('/configuracion', 'configuracion.configuracion')->name('configuracion');

    Route::get('/facturas', function () {
        return view('facturacion.facturas');
    })->name('facturas');

    Route::get('/calendario', function () {
        return view('booking.calendar'); 
    })->name('booking.view');
});