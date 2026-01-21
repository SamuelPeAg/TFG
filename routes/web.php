<?php

use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\FacturacionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\NominaController;
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
    // 1. Ver la lista de Pagos
    Route::get('/Pagos', [PagosController::class, 'index'])->name('Pagos');
    Route::post('/Pagos', [PagosController::class, 'store'])->name('Pagos.store');

    // Buscador
    Route::get('/usuarios/Pagos', [PagosController::class, 'buscarPorUsuario'])->name('Pagos.buscar');
    
   // Ejemplo en web.php
    // Gestión de usuarios para admin o entrenador
    Route::resource('users', UserController::class)->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::post('/users/crear-grupo', [UserController::class, 'storeGroup'])->name('users.group.store')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    Route::delete('/users/grupos/{id}', [UserController::class, 'destroyGroup'])->name('users.group.destroy')->middleware(\App\Http\Middleware\AdminOrEntrenadorMiddleware::class);
    // Gestión de entrenadores (solo admin)
    Route::resource('entrenadores', EntrenadorController::class)->middleware(\App\Http\Middleware\AdminMiddleware::class);
    
    Route::get('/configuracion', [UserController::class, 'configuracion'])->name('configuracion.edit');
    Route::put('/configuracion', [UserController::class, 'updateConfiguracion'])->name('configuracion.update');

     
// Agrega esto dentro de tu grupo de middleware 'auth' si es necesario
Route::resource('nominas', NominaController::class)->names('nominas');


    Route::get('/calendario', function () {
        return view('booking.calendar'); 
    })->name('booking.view');
});

Route::get('/nominas', function () {
    
    // 1. Inventamos unos datos falsos para que la tabla no de error
    $nominas = [
        (object)[
            'id' => 1,
            'user_id' => 1,
            'user' => (object)[
                'nombre' => 'Juan Pérez', 
                'email' => 'juan@demo.com'
            ],
            'fecha_emision' => '2024-01-15',
            'importe' => 1450.50,
            'concepto' => 'Nómina Enero',
            'archivo_path' => 'ruta/falsa.pdf'
        ],
        (object)[
            'id' => 2,
            'user_id' => 2,
            'user' => (object)[
                'nombre' => 'Laura García', 
                'email' => 'laura@demo.com'
            ],
            'fecha_emision' => '2024-01-15',
            'importe' => 1200.00,
            'concepto' => 'Nómina Enero',
            'archivo_path' => null
        ]
    ];

    // 2. Inventamos usuarios para que el selector del Modal funcione
    $users = [
        (object)['id' => 1, 'nombre' => 'Juan Pérez', 'email' => 'juan@demo.com'],
        (object)['id' => 2, 'nombre' => 'Laura García', 'email' => 'laura@demo.com'],
    ];

    // 3. Cargamos la vista pasándole estos datos falsos
    return view('nominas.nominasAdmin', compact('nominas', 'users'));

})->name('nominas');