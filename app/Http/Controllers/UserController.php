<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserGroup; // <--- IMPORTANTE
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        // Mostrar solo clientes en la interfaz de usuarios
        $users = User::role('cliente')->with('groups')->get();
        
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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'IBAN' => $request->IBAN,
            'FirmaDigital' => $request->firma_digital, // Ajusta si tu columna se llama diferente
        ]);

        // Asignar rol cliente por defecto
        $user->assignRole('cliente');

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
}