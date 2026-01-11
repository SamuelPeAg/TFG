<?php

use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Request;
use App\Http\Controllers\UserController;


Route::get('/', function () {
    return view('welcome');
})->name('welcome');

Route::resource('entrenadores', EntrenadorController::class);

Route::resource('users', UserController::class);

Route::get('/sesiones', function () {
    return view('sessions.sesiones');
})->name("sesiones");



Route::get('/login', function () {
    return view('login.signup.login'); 
})->name('login'); 

Route::post("/login", [LoginController::class, "login"]);


Route::get('/register', [RegisterController::class, 'show'])->name('register');
Route::post('/register', [RegisterController::class, 'store']);





Route::get('/contacto', function () {
    return view('contact');
})->name('contact');


Route::get('/facturas', function () {
    return view('facturacion.facturas');
})->name('facturas');

// -----------------------------------------------------------------------------
// RUTAS LEGALES (Footer)
// -----------------------------------------------------------------------------

// 1. Aviso Legal
Route::get('/aviso-legal', function () {
    return view('legal.notice');
})->name('legal.notice');

// 2. Política de Privacidad
Route::get('/politica-privacidad', function () {
    return view('legal.privacy');
})->name('privacy.policy');

// 3. Política de Cookies
Route::get('/politica-cookies', function () {
    return view('legal.cookies');
})->name('cookies.policy');


Route::post('/logout', function () {
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/'); // O redirige a login con: return redirect()->route('login');
})->name('logout');


// Ruta sencilla para ver el calendario
Route::get('/calendario', function () {
    return view('booking.calendar'); // Asegúrate de que tu archivo esté en resources/views/booking/calendar.blade.php
})->middleware('auth')->name('booking.view'); 

// Nota: Le he dejado el middleware 'auth' para que al menos te pida login. 
// Si quieres que sea pública (visible sin login), quita ->middleware('auth').
?>

