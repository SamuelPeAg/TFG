<?php

namespace App\Http\Controllers;

use App\Mail\EntrenadorRegistrationMail;
use App\Models\Entrenador;
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
        // Ahora obtenemos todos del modelo Entrenador (que solo contiene entrenadores y admins)
        $entrenadores = Entrenador::role('entrenador')->get();
        return view('entrenadores.index', compact('entrenadores'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'   => ['required', 'string', 'min:3', 'max:50'],
            'email'    => ['required', 'email', 'max:191', 'unique:entrenadores,email'],
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El formato del correo no es válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
        ]);

        $token = Str::random(60);
        
        // Crear el entrenador
        $entrenador = Entrenador::create([
            'name'     => $request->nombre,
            'email'    => $request->email,
            'password' => Hash::make(Str::random(24)), 
            'activation_token' => $token,
            'activation_token_created_at' => now(),
        ]);

        // Asignar rol de entrenador
        $entrenador->assignRole('entrenador');

        // Enviar el email con el enlace de activación
        Mail::to($entrenador->email)->send(new EntrenadorRegistrationMail($entrenador, $token));

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador añadido correctamente. Se ha enviado un enlace al correo para completar el registro.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|confirmed|min:8',
        ], [
            'password.required'  => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
        ]);

        $entrenador = Entrenador::findOrFail($id);

        $entrenador->update([
            'password' => Hash::make($request->password),
            'activation_token' => null,
        ]);

        return redirect()->route('login')->with('success', 'Registro completado exitosamente.');
    }

    public function destroy($id)
    {
        $entrenador = Entrenador::findOrFail($id);
        $entrenador->delete();

        return redirect()->route('entrenadores.index');
    }

    public function activarEntrenador($token)
    {
        $entrenador = Entrenador::where('activation_token', $token)->first();

        if (!$entrenador) {
            return redirect()->route('login')->with('error', 'Token de activación inválido.');
        }

        // Verificar expiración (24 horas)
        if ($entrenador->activation_token_created_at && $entrenador->activation_token_created_at->addDay()->isPast()) {
            return redirect()->route('login')->with('error', 'El enlace de activación ha expirado (válido por 24h). Contacta al administrador.');
        }

        return view('entrenadores.activar', compact('entrenador', 'token'));
    }

    public function completeActivation(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|confirmed|min:8',
            'token' => 'required|string',
        ], [
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        ]);

        $entrenador = Entrenador::findOrFail($id);

        if ($entrenador->activation_token !== $request->token) {
             return back()->with('error', 'Token de seguridad inválido o expirado.');
        }

        // Verificar expiración nuevamente al procesar
        if ($entrenador->activation_token_created_at && $entrenador->activation_token_created_at->addDay()->isPast()) {
            return redirect()->route('login')->with('error', 'El enlace de activación ha expirado.');
        }

        $entrenador->update([
            'password' => Hash::make($request->password),
            'activation_token' => null, 
            'activation_token_created_at' => null,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('login')->with('success', 'Cuenta activada correctamente. Ya puedes iniciar sesión.');
    }
}
