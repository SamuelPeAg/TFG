<?php

namespace App\Http\Controllers;

use App\Mail\EntrenadorRegistrationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\PermissionRegistrar;
use Str;

class EntrenadorController extends Controller
{
    public function index()
    {
        $entrenadores = User::role('entrenador')->get();
        return view('entrenadores.index', compact('entrenadores'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'   => ['required', 'string', 'min:3', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
        ]);

        // Crear el usuario entrenador (solo nombre y email)
        $user = User::create([
            'name'     => $request->nombre,
            'email'    => $request->email,
            'password' => Hash::make(Str::random(24)),  // Contraseña temporal
        ]);

        // Crear un token de activación para el entrenador
        $token = Str::random(60);

        // Verificar que el token se genera correctamente

        // Actualiza el usuario con el token
        $user->update(['activation_token' => $token]);
        dd($user);  

        // Enviar el email con el enlace de activación
        Mail::to($user->email)->send(new EntrenadorRegistrationMail($user, $token));

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador añadido correctamente. Se ha enviado un enlace al correo para completar el registro.');
    }



    public function update(Request $request, $id)
    {
        $user = User::whereKey($id)->firstOrFail();

        // Validar los campos
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'iban'     => ['required', 'string', 'min:15', 'max:34'],
        ]);

        // Actualizar la información del usuario
        $user->update([
            'password' => Hash::make($request->password),
            'iban'     => $request->iban,
            'activation_token' => null,  // Borrar el token de activación
        ]);

        // Asignar rol de entrenador
        $user->assignRole('entrenador');

        return redirect()->route('login')->with('success', 'Registro completado exitosamente.');
    }


    public function destroy($id)
    {
        $user = User::role('entrenador')->whereKey($id)->firstOrFail();

        $user->delete();

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador eliminado correctamente.');
    }

    public function activarEntrenador($token)
    {
    // Buscar el usuario con ese token
        $user = User::where('activation_token', $token)->first();

        // Verificar si el usuario fue encontrado
        if (!$user) {
            // Si no se encuentra el usuario, puedes devolver un error o redirigir
            return redirect()->route('login')->with('error', 'Token de activación inválido.');
        }

        // Si se encuentra el usuario, renderizamos la vista de activación
        return view('entrenadores.activar', compact('user', 'token'));
    }

}
