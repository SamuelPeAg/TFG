<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// Tus rutas existentes...
Route::get('/', function () {
    return view('welcome');
});
Route::resource('users', UserController::class);


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



Route::get('/admin/sesiones', function () {
    return view('admin.sesiones.index');
})->name('sesiones.index');
?>

