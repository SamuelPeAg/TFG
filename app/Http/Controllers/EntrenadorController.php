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
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.min'      => 'El nombre debe tener al menos 3 caracteres.',
            'email.required'  => 'El correo electrónico es obligatorio.',
            'email.email'     => 'El formato del correo no es válido.',
            'email.unique'    => 'Este correo electrónico ya está registrado.',
        ]);
        $token = Str::random(60);
        // Crear el usuario entrenador (solo nombre y email)
        $user = User::create([
            'name'     => $request->nombre,
            'email'    => $request->email,
            'password' => Hash::make(Str::random(24)), 
            'activation_token' => $token 
        ]);
        // Crear un token de activación para el entrenador
        $user->assignRole('entrenador');

        

        // Enviar el email con el enlace de activación
        Mail::to($user->email)->send(new EntrenadorRegistrationMail($user, $token));

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador añadido correctamente. Se ha enviado un enlace al correo para completar el registro.');
    }



    public function update(Request $request, $id)
    {

        $request->validate([
        'password' => 'required|confirmed|min:8',
        // 'iban'     => 'required|string|min:24', 
    ], [
        'password.required'  => 'La contraseña es obligatoria.',
        'password.confirmed' => 'Las contraseñas no coinciden.',
        'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
        // 'iban.required'      => 'El campo IBAN es obligatorio.',
        // 'iban.min'           => 'El IBAN debe tener el formato completo (24 caracteres).',
    ]);
        $user = User::whereKey($id)->firstOrFail();

        // Validar los campos
        // Validar los campos (ya validados arriba)
        // $request->validate([...]);

        // Actualizar la información del usuario
        $user->update([
            'password' => Hash::make($request->password),
            // 'iban'     => $request->iban,
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
