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
            'nombre' => ['required', 'string', 'min:3', 'max:50'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email'],
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El formato del correo no es válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
        ]);
        $token = Str::random(60);
        // Crear el usuario entrenador (solo nombre y email)
        $user = User::create([
            'name' => $request->nombre,
            'email' => $request->email,
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
            'password' => 'nullable|confirmed|min:8',
            'iban' => 'nullable|string|min:8|max:34',
        ], [
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'iban.max' => 'El IBAN no puede tener más de 34 caracteres.',
            'iban.min' => 'El IBAN debe tener al menos 8 caracteres.',
        ]);

        $user = User::findOrFail($id);

        $data = [
            'iban' => $request->iban,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Eliminar foto de perfil si se solicita
        if ($request->has('delete_profile_photo') && $request->delete_profile_photo == '1') {
            if ($user->foto_de_perfil) {
                // Opcional: Eliminar archivo del disco
                // \Storage::disk('public')->delete($user->foto_de_perfil);
                $data['foto_de_perfil'] = null;
            }
        }

        $user->update($data);

        return redirect()->route('entrenadores.index')->with('success', 'Datos del entrenador actualizados correctamente.');
    }


    public function destroy($id)
    {
        $user = User::role('entrenador')->whereKey($id)->firstOrFail();

        $user->delete();

        return redirect()->route('entrenadores.index');
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

        $user = User::findOrFail($id);

        // Security Check: Verify token matches
        if ($user->activation_token !== $request->token) {
            return back()->with('error', 'Token de seguridad inválido o expirado.');
        }

        $user->update([
            'password' => Hash::make($request->password),
            'activation_token' => null,
            'email_verified_at' => now(), // Mark as verified
        ]);

        // Autologin del usuario tras activar la cuenta
        Auth::login($user); 

        return redirect()->route('calendario')->with('success', '¡Cuenta activada correctamente! Ya estás dentro de Factomove.');
    }

}
