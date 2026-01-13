<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserGroup; // <--- IMPORTANTE
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;


class UserController extends Controller
{
    public function index()
    {
        // Cargamos usuarios con sus grupos para mostrarlos en la tabla
        $users = User::with('groups')->get();
        
        // Cargamos todos los grupos disponibles para el modal de gestión
        $groups = UserGroup::withCount('users')->get();

        return view('users.index', compact('users', 'groups'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'IBAN' => 'nullable|unique:users',
            'firma_digital' => 'nullable',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'IBAN' => $request->IBAN,
            'FirmaDigital' => $request->firma_digital, // Ajusta si tu columna se llama diferente
        ]);

        return redirect()->route('users.index')->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'IBAN' => 'nullable|unique:users,IBAN,' . $user->id,
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'IBAN' => $request->IBAN,
            'FirmaDigital' => $request->firma_digital,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Usuario eliminado correctamente.');
    }

    // --- MÉTODOS PARA GRUPOS ---

    public function storeGroup(Request $request)
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'users' => 'required|array|min:2',
        ]);

        $group = UserGroup::create(['name' => $request->group_name]);
        $group->users()->attach($request->users);

        return redirect()->route('users.index')
            ->with('success', 'Grupo "' . $request->group_name . '" creado con éxito.');
    }

    public function destroyGroup($id)
    {
        $group = UserGroup::findOrFail($id);
        $group->delete(); // Elimina el grupo y la relación pivote

        return redirect()->route('users.index')
            ->with('success', 'Grupo eliminado correctamente.');
    }

    //Métodos de configuracion
    public function configuracion(Request $request)
    {
        return view('configuracion.configuracion', [
            'user' => $request->user(),
        ]);
    }

    public function updateConfiguracion(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            // si quieres permitir IBAN / FirmaDigital desde configuración:
            'IBAN' => ['nullable', Rule::unique('users', 'IBAN')->ignore($user->id)],
            'firma_digital' => ['nullable', 'string'],

            // Password opcional (solo si se rellena)
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'email.unique' => 'Ese email ya está en uso.',
            'IBAN.unique' => 'Ese IBAN ya está en uso.',
            'password.confirmed' => 'La confirmación no coincide.',
        ]);

        // Datos básicos
        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'IBAN' => $validated['IBAN'] ?? $user->IBAN,
            'FirmaDigital' => $validated['firma_digital'] ?? $user->FirmaDigital,
        ];

        // Cambiar contraseña SOLO si el usuario escribe una nueva
        if ($request->filled('password')) {
            $request->validate([
                'current_password' => ['required'],
            ], [
                'current_password.required' => 'Debes escribir tu contraseña actual.',
            ]);

            if (!Hash::check($request->current_password, $user->password)) {
                return back()
                    ->withErrors(['current_password' => 'La contraseña actual no es correcta.'])
                    ->withInput();
            }

            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'Configuración actualizada correctamente.');
    }

}