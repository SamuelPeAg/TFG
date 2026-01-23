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
            'nombre.required'    => 'El nombre completo es obligatorio.',
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.email'        => 'Introduce un correo válido.',
            'email.unique'       => 'Este correo ya está registrado en el sistema.',
        ]);

        // Crear el usuario entrenador (solo nombre y email)
        $user = User::create([
            'name'     => $request->nombre,
            'email'    => $request->email,
            'password' => Hash::make(Str::random(24)),  // Contraseña temporal
        ]);

        // Crear un token de activación para el entrenador
        $token = Str::random(60);
        $user->update(['activation_token' => $token]);

        // Enviar el email con el enlace de activación
        Mail::to($user->email)->send(new EntrenadorRegistrationMail($user, $token));

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador añadido correctamente. Se ha enviado un enlace al correo para completar el registro.');
    }

    public function update(Request $request, $id)
    {
        $user = User::role('entrenador')->whereKey($id)->firstOrFail();

        $request->validate([
            'iban'     => ['required', 'string', 'min:15', 'max:34'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ], [
            'iban.required'      => 'El iban es obligatorio.',
            'password.min'       => 'La contraseña nueva debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $data = [
            'iban'  => $request->iban,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        if (! $user->hasRole('entrenador')) {
            $user->assignRole('entrenador');
        }

        $current = Auth::user();
        if ($current && $current->hasRole('admin')) {
            if ($request->boolean('make_admin')) {
                if (! $user->hasRole('admin')) {
                    $user->assignRole('admin');
                }
            } else {
                if ($user->hasRole('admin')) {
                    $user->removeRole('admin');
                }
            }
        }

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador actualizado correctamente.');
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
    $user = User::where('activation_token', $token)->firstOrFail();

    // Aquí puedes mostrar un formulario donde el usuario complete la información faltante
    // Ejemplo: volver a pasar el token al formulario de actualización

    return view('entrenadores.activar', compact('user', 'token'));
    }
}
