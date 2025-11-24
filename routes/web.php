<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserReservationController;

Route::get('/', function () {
    return view('principal');
});
Route::resource('users', UserController::class);
Route::get('/sesiones', function () {
    return view('sesiones');
});

// Endpoint to fetch reservations for a user (used by usuarios calendar)
// Route::get('/usuarios/reservas', [UserReservationController::class, 'search']);


