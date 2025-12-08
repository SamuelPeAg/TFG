<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserReservationController;
use App\Http\Controllers\TrainerController;

// Tus rutas existentes...
Route::get('/', function () {
    return view('welcome');
})->name('welcome');
Route::resource('trainers', TrainerController::class);
Route::resource('users', UserController::class);

Route::get('/sesiones', function () {
    return view('sesiones');
})->name("sesiones");



Route::get('/login', function () {
    return view('login'); 
})->name('login'); 

Route::post("/login", [LoginController::class, "login"]);

Route::post('/register', [RegisterController::class, 'store'])->name('register');

Route::get('/register', [RegisterController::class, 'show'])->name('register.form');



Route::get('/contacto', function () {
    return view('contact');
})->name('contact');


Route::get('/facturas', function () {
    return view('facturas');
})->name('facturas');

?>

