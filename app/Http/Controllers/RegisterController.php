<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
     public function show()
    {
        return view('register');
    }

    /**
     * Procesa el formulario de registro
     */
    public function store(Request $request)
    {
        // VALIDAR CAMPOS
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:users,name'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        // CREAR USUARIO
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // INICIAR SESIÓN AUTOMÁTICAMENTE
        Auth::login($user);

        // REDIRIGIR DESPUÉS DE REGISTRAR
        return redirect('/users');  // Cambia esto si quieres otra ruta
    }

}
