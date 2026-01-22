<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\PermissionRegistrar;

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
            'iban'     => ['required', 'string', 'min:15', 'max:34'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'nombre.required'    => 'El nombre completo es obligatorio.',
            'nombre.min'         => 'El nombre debe tener al menos 3 letras.',
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.email'        => 'Introduce un correo válido.',
            'email.unique'       => 'Este correo ya está registrado en el sistema.',
            'iban.required'      => 'El iban es necesario.',
            'iban.min'           => 'El iban parece incompleto (mínimo 15 caracteres).',
            'password.required'  => 'La contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $user = User::create([
            'name'     => $request->nombre,
            'email'    => $request->email,
            'iban'     => $request->iban,
            'password' => Hash::make($request->password),
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $user->assignRole('entrenador');

        $current = Auth::user();
        if ($current && $current->hasRole('admin') && $request->boolean('make_admin')) {
            $user->assignRole('admin');
        }

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador añadido correctamente.');
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
}
