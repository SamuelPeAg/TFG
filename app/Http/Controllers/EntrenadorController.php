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
            'dni'      => ['nullable', 'string', 'max:20'],
            'telefono' => ['nullable', 'string', 'max:20'],
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
            'activation_token' => $token,
            'dni'      => $request->dni,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
            'fecha_nacimiento' => $request->fecha_nacimiento,
        ]);
        // Crear un token de activación para el entrenador
        $user->assignRole('entrenador');

        

        // Enviar el email con el enlace de activación
        Mail::to($user->email)->send(new EntrenadorRegistrationMail($user, $token));

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador añadido correctamente. Se ha enviado un enlace al correo para completar el registro.');
    }



    public function update(Request $request, $id)
    {
        $user = User::whereKey($id)->firstOrFail();

        $request->validate([
            'password' => 'nullable|confirmed|min:8',
            'dni'      => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
        ]);

        $data = [
            'dni'              => $request->dni,
            'telefono'         => $request->telefono,
            'direccion'        => $request->direccion,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'iban'             => $request->iban,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
            $data['activation_token'] = null;
        }

        $user->update($data);

        // Si es admin logueado, redirigir a la lista. 
        if (auth()->check()) {
            // Manejar checkbox de admin
            if (auth()->user()->hasRole('admin') && $request->has('make_admin')) {
                if ($request->make_admin == '1') {
                    $user->assignRole('admin');
                } else {
                    $user->removeRole('admin');
                }
            }
            return redirect()->route('entrenadores.index')->with('success', 'Entrenador actualizado correctamente.');
        }

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

    public function completeActivation(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|confirmed|min:8',
            'token'    => 'required|string',
        ], [
            'password.required'  => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
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

        // Auto login? Or redirect to login?
        // Auth::login($user); 

        return redirect()->route('login')->with('success', 'Cuenta activada correctamente. Ya puedes iniciar sesión.');
    }

}
