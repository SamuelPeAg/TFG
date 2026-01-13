<?php

namespace App\Http\Controllers;

use App\Models\Entrenador;
use App\Models\User;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;

class EntrenadorController extends Controller
{
    public function index()
    {
        // Mostrar solo los entrenadores cuyo email pertenece a un User con rol 'entrenador'
        $emails = User::role('entrenador')->pluck('email')->toArray();
        $entrenadores = Entrenador::whereIn('email', $emails)->get();
        return view('entrenadores.index', compact('entrenadores'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'   => 'required|string|max:255',
            'email'    => 'required|email|unique:entrenadores,email',
            'iban'     => 'required|string|max:34',
            'password' => 'required|min:8|confirmed',
        ]);

        $entrenador = Entrenador::create([
            'nombre'   => $request->nombre,
            'email'    => $request->email,
            'iban'     => $request->iban,
            'password' => Hash::make($request->password),
            'rol'      => 'entrenador', 
        ]);

        // Crear/actualizar el User asociado y asignarle rol 'entrenador'
        $user = User::firstOrCreate(
            ['email' => $request->email],
            ['name' => $request->nombre, 'password' => Hash::make($request->password)]
        );

        // Limpiar caché de permisos antes de asignar
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Asegurar que siempre tenga rol 'entrenador'
        if ($user && method_exists($user, 'hasRole') && ! $user->hasRole('entrenador')) {
            $user->assignRole('entrenador');
        }

        // Si el usuario autenticado es admin y marcó la casilla, añadir rol admin
        $current = Auth::user();
        if ($current && method_exists($current, 'hasRole') && $current->hasRole('admin') && $request->boolean('make_admin')) {
            if ($user && method_exists($user, 'hasRole') && ! $user->hasRole('admin')) {
                $user->assignRole('admin');
            }
        }

        return redirect()->route('entrenadores.index')
            ->with('success', 'Entrenador añadido correctamente.');
    }

    // --- AQUÍ ESTÁ LA CORRECCIÓN DEL UPDATE ---
    public function update(Request $request, $id)
    {
        // 1. Buscamos el entrenador manualmente por ID
        $entrenador = Entrenador::findOrFail($id);

        // 2. Validación (Usamos $id para ignorar el email actual de este usuario)
        $request->validate([
            'nombre'   => 'required|string|max:255',
            'email'    => 'required|email|unique:entrenadores,email,' . $id,
            'iban'     => 'required|string|max:34',
            'password' => 'nullable|min:8|confirmed',
        ]);

        // 3. Preparar datos
        $data = [
            'nombre' => $request->nombre,
            'email'  => $request->email,
            'iban'   => $request->iban,
        ];

        // 4. Solo actualizar contraseña si se escribió una nueva
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // 5. Guardar
        $entrenador->update($data);

        // Actualizar/crear User asociado
        $user = User::firstOrCreate(
            ['email' => $entrenador->email],
            ['name' => $entrenador->nombre, 'password' => Hash::make($request->password ?? 'password')]
        );
        // Si el email fue cambiado, sincronizar
        if ($user->email !== $request->email) {
            $user->email = $request->email;
            $user->save();
        }

        // Si el password fue actualizado, sincronizar
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        // Limpiar caché y asegurar rol 'entrenador' siempre
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        if ($user && method_exists($user, 'hasRole') && ! $user->hasRole('entrenador')) {
            $user->assignRole('entrenador');
        }

        // Permitir a admin dar/quitar rol admin mediante campo 'make_admin'
        $current = Auth::user();
        if ($current && method_exists($current, 'hasRole') && $current->hasRole('admin')) {
            if ($request->boolean('make_admin')) {
                if ($user && method_exists($user, 'hasRole') && ! $user->hasRole('admin')) {
                    $user->assignRole('admin');
                }
            } else {
                if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
                    $user->removeRole('admin');
                }
            }
        }

        return redirect()->route('entrenadores.index')
            ->with('success', 'Entrenador actualizado correctamente.');
    }

    public function destroy($id)
    {
        try {
            $entrenador = Entrenador::findOrFail($id);
            $entrenador->delete();

            return redirect()->route('entrenadores.index')
                ->with('success', 'Entrenador eliminado correctamente.');

        } catch (QueryException $e) {
            if ($e->getCode() == "23000") {
                return back()->withErrors(['error' => 'No se puede eliminar: Este entrenador tiene sesiones asignadas.']);
            }
            return back()->withErrors(['error' => 'Error de base de datos: ' . $e->getMessage()]);
            
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ocurrió un error inesperado: ' . $e->getMessage()]);
        }
    }
}