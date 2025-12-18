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
        return view('login.signup.register');
    }

    /**
     * Procesa el formulario de registro
     */
    public function store(Request $request)
    {
        // VALIDAR CAMPOS
   $request->validate([
        'name' => ['required', 'string', 'min:3', 'max:20', 'regex:/^[a-zA-Z0-9]+$/'],
        'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', 'confirmed', 'min:8'],
    ], [
        // AQUÍ TRADUCES LOS MENSAJES UNO POR UNO
        'name.required' => 'El nombre es obligatorio.',
        'name.min' => 'El nombre debe tener al menos 3 caracteres.',
        'email.required' => 'El correo electrónico es obligatorio.',
        'email.email' => 'Debes introducir un correo válido.',
        'email.unique' => 'Este correo ya está en uso.',
        'password.required' => 'La contraseña es obligatoria.',
        'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        'password.confirmed' => 'Las contraseñas no coinciden.',
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
