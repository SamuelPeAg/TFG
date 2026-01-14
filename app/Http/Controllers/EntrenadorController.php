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
        // --- 1. VALIDACIONES ROBUSTAS (Mínimo 3-4 reglas por campo) ---
        $request->validate([
            // Nombre: Obligatorio, Texto, Mínimo 3 letras, Máximo 255
            'nombre'   => 'required|string|min:3|max:255',
            
            // Email: Obligatorio, Formato válido, Único en la tabla users
            'email'    => 'required|email|unique:users,email|unique:entrenadores,email',
            
            // IBAN: Obligatorio, Texto, Minimo 15 caracteres, Maximo 34
            'iban'     => 'required|string|min:15|max:34',
            
            // Password: Obligatorio, String, Mínimo 8, Confirmado (coincide con password_confirmation)
            'password' => 'required|string|min:8|confirmed',
        ], [
            // --- MENSAJES PERSONALIZADOS ---
            'nombre.required'    => 'El nombre completo es obligatorio.',
            'nombre.min'         => 'El nombre debe tener al menos 3 letras.',
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.email'        => 'Introduce un correo válido.',
            'email.unique'       => 'Este correo ya está registrado en el sistema.',
            'iban.required'      => 'El IBAN es necesario.',
            'iban.min'           => 'El IBAN parece incompleto (mínimo 15 caracteres).',
            'password.required'  => 'La contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        // Crear el Entrenador
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

    public function update(Request $request, $id)
    {
        // 1. Buscamos el entrenador manualmente por ID
        $entrenador = Entrenador::findOrFail($id);

        // --- VALIDACIONES DE EDICIÓN ---
        $request->validate([
            'nombre'   => 'required|string|min:3|max:255',
            // En update ignoramos el ID del entrenador actual para que no de error de "ya existe"
            'email'    => 'required|email|unique:entrenadores,email,' . $id,
            'iban'     => 'required|string|min:15|max:34',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'nombre.required'    => 'El nombre es obligatorio.',
            'email.unique'       => 'Este correo ya está en uso por otro usuario.',
            'iban.required'      => 'El IBAN es obligatorio.',
            'password.min'       => 'La contraseña nueva debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
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
        if ($current && method_exists($current, 'hasRole') && $current && $current->hasRole('admin')) {
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