<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserReservationController;

// Tus rutas existentes...
Route::get('/', function () {
    return view('welcome');
})->name('welcome');


Route::resource('users', UserController::class);

Route::get('/sesiones', function () {
    return view('sesiones');
})->name("sesiones");

// Endpoint to fetch reservations for a user (used by usuarios calendar)
// Route::get('/usuarios/reservas', [UserReservationController::class, 'search']);


// --- PEGA ESTO EXACTAMENTE ASÍ ---

// 1. Ruta para VER el login
// Cambiamos 'auth.login' por 'login' porque no tienes carpeta auth


//el login//

Route::get('/login', function () {
    return view('login'); 
})->name('login'); 

Route::post("/login", [LoginController::class, "login"]);




Route::get('/register', function () {
    return view('register');
})->name('register');


// ... tus otras rutas ...

Route::get('/contacto', function () {
    return view('contact');
})->name('contact');


Route::get('/facturas', function () {
    return view('facturas');
})->name('facturas');

?>

