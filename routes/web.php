<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Request;
use App\Http\Controllers\UserController;

// Tus rutas existentes...
Route::get('/', function () {
    return view('welcome');
})->name('welcome');
Route::resource('users', UserController::class);


// --- PEGA ESTO EXACTAMENTE ASÍ ---

// 1. Ruta para VER el login
// Cambiamos 'auth.login' por 'login' porque no tienes carpeta auth
Route::get('/login', function () {
    return view('login'); 
})->name('login'); 

// 2. Ruta FALSA para procesar el login (para que no de error al dar click)
Route::post('/login', function () {
    return "Login procesado (Falta lógica)";
});



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

