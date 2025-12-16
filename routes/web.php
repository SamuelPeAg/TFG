<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserReservationController;
use App\Http\Controllers\TrainerController;


Route::get('/', function () {
    return view('welcome');
})->name('welcome');
Route::resource('trainers', TrainerController::class);
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
?>

