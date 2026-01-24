<?php

use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\FacturacionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PagosController;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS (Cualquiera puede entrar)
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

Route::get('/activar-entrenador/{token}', [EntrenadorController::class, 'activarEntrenador'])->name('entrenadores.activar');
// La gestión de entrenadores debe requerir autenticación y rol admin (se añadirá en el grupo auth más abajo)

// Las rutas de gestión de usuarios deben estar protegidas (ver sección auth)

// Rutas Legales
Route::get('/aviso-legal', function () { return view('legal.notice'); })->name('legal.notice');

Route::get('/politica-privacidad', function () { return view('legal.privacy'); })->name('privacy.policy');

Route::get('/politica-cookies', function () { return view('legal.cookies'); })->name('cookies.policy');

Route::get('/contacto', function () { return view('contact'); })->name('contact');

// Ruta POST para enviar formulario de contacto
Route::post('/contacto/enviar', function (Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'phone' => 'nullable|string|max:20',
        'message' => 'required|string|max:1000',
    ]);

    // Aquí puedes añadir lógica para enviar email, guardar en BD, etc.
    // Por ahora solo retornamos con mensaje de éxito
    
    return redirect()->route('contact')->with('success', '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.');
})->name('contact.send');


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
    // 1. Ver la lista de Pagos
    Route::get('/Pagos', [PagosController::class, 'index'])->name('Pagos')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::post('/Pagos', [PagosController::class, 'store'])->name('Pagos.store')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);

    // Buscador
    Route::get('/usuarios/Pagos', [PagosController::class, 'buscarPorUsuario'])->name('Pagos.buscar')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    
   // Ejemplo en web.php
    // Gestión de usuarios para admin o entrenador
    Route::resource('users', UserController::class)->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::post('/users/crear-grupo', [UserController::class, 'storeGroup'])->name('users.group.store')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::delete('/users/grupos/{id}', [UserController::class, 'destroyGroup'])->name('users.group.destroy')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    // Gestión de entrenadores (solo admin)
    Route::resource('entrenadores', EntrenadorController::class)->middleware(\App\Http\Middleware\AdminMiddleware::class);
    
   Route::get("/calendario",[CalendarioController::class,"index"])->name("calendario");

    // Route::get('/calendario', function () {
    //     return view('booking.calendar'); 
    // })->name('booking.view');
});
Route::get('/configuracion', [UserController::class, 'configuracion'])->name('configuracion.edit')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])->name('configuracion.update')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);


