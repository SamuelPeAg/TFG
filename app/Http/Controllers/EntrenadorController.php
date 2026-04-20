<?php

namespace App\Http\Controllers;

use App\Mail\EntrenadorRegistrationMail;
use App\Models\Entrenador;
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
        $entrenadores = Entrenador::role('entrenador', 'staff')->get();
        if (request()->wantsJson() || request()->ajax()) {
            return response()->json($entrenadores);
        }
        return view('app');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'min:3', 'max:50'],
            'email' => ['required', 'email', 'max:191', 'unique:entrenadores,email'],
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El formato del correo no es válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
        ]);
        $token = Str::random(60);
        // Crear el usuario entrenador (solo nombre y email)
        $user = Entrenador::create([
            'name' => $request->nombre,
            'email' => $request->email,
            'password' => Hash::make(Str::random(24)),
            'activation_token' => $token
        ]);
        // Asignar rol
        $user->assignRole('entrenador');



        try {
             // Enviar el email con el enlace de activación
            Mail::to($user->email)->send(new EntrenadorRegistrationMail($user, $token));
        } catch (\Exception $e) {
            \Log::error('Error sending trainer mail: ' . $e->getMessage());
            return response()->json(['message' => 'Error al enviar el correo: ' . $e->getMessage()], 500);
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Entrenador añadido correctamente. Se ha enviado un enlace al correo para completar el registro.', 'user' => $user], 201);
        }

        return redirect()->route('entrenadores.index')->with('success', 'Entrenador añadido correctamente. Se ha enviado un enlace al correo para completar el registro.');
    }



    public function update(Request $request, $id)
    {
        $request->validate([
            'password' => 'nullable|confirmed|min:8|max:64',
            'iban' => 'nullable|string|min:8|max:34',
        ], [
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña de seguridad no debe exceder 64 caracteres.',
            'iban.max' => 'El IBAN no puede tener más de 34 caracteres.',
            'iban.min' => 'El IBAN debe tener al menos 8 caracteres.',
        ]);

        $user = Entrenador::findOrFail($id);

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

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Datos del entrenador actualizados correctamente.', 'user' => $user], 200);
        }

        return redirect()->route('entrenadores.index')->with('success', 'Datos del entrenador actualizados correctamente.');
    }


    public function destroy($id)
    {
        $user = Entrenador::role('entrenador', 'staff')->whereKey($id)->firstOrFail();

        $user->delete();

        if (request()->wantsJson() || request()->ajax()) {
            return response()->json(['message' => 'Entrenador eliminado correctamente.'], 200);
        }

        return redirect()->route('entrenadores.index');
    }




    public function showActivationForm($token)
    {
        $user = Entrenador::where('activation_token', $token)->first();

        if (!$user) {
            return redirect('/login')->with('error', 'El enlace de activación es inválida o ha expirado.');
        }

        return view('app');
    }

    /**
     * API para obtener info del entrenador por token (usado por React)
     */
    public function getTrainerByToken($token)
    {
        $user = Entrenador::where('activation_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Token inválido.'], 404);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
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

        $user = Entrenador::findOrFail($id);

        // Control de doble submit / Token expirado
        if ($user->activation_token !== $request->token) {
            if ($user->activo) {
                // Si la cuenta ya está activa, simplemente le decimos que fue un éxito
                // para que el frontend (React) siga su camino al login o donde corresponda.
                return response()->json(['message' => 'La cuenta ya estaba activa.']);
            }
            return response()->json(['errors' => ['general' => 'Token de seguridad inválido o expirado.']], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'activation_token' => null,
            'activo' => true,
            'email_verified_at' => now(), // Mark as verified
        ]);

        // Autologin del usuario tras activar la cuenta
        Auth::guard('staff')->login($user); 

        return response()->json(['message' => 'Cuenta activada correctamente. Ya puedes iniciar sesión.']);
    }

    public function getPermissions($id)
    {
        $this->ensurePermissionsExist();
        $entrenador = Entrenador::findOrFail($id);
        
        // Permisos fijos para este guard
        $allPermissions = [
            ['id' => 'acceder_nominas_admin', 'label' => 'Acceso Nóminas Admin'],
            ['id' => 'acceder_facturacion', 'label' => 'Acceso Facturación'],
            ['id' => 'crear_clases', 'label' => 'Crear Clases'],
            ['id' => 'acceder_suscripciones', 'label' => 'Acceso Suscripciones'],
        ];

        // Obtener nombres de permisos asignados
        $assignedPermissions = $entrenador->getAllPermissions()->pluck('name')->toArray();

        return response()->json([
            'all' => $allPermissions,
            'assigned' => $assignedPermissions
        ]);
    }

    public function syncPermissions(Request $request, $id)
    {
        $this->ensurePermissionsExist();
        try {
            $entrenador = Entrenador::findOrFail($id);
            $permissions = $request->input('permissions', []);
            
            // Validar que los permisos existan para el guard staff
            $exists = \Spatie\Permission\Models\Permission::whereIn('name', $permissions)
                ->where('guard_name', 'staff')
                ->count();
                
            if (count($permissions) > 0 && $exists !== count($permissions)) {
                return response()->json(['message' => 'Uno o más permisos no son válidos o no existen.'], 422);
            }

            // Spatie: sincronizar los permisos indicados
            $entrenador->syncPermissions($permissions);

            return response()->json(['message' => 'Permisos actualizados correctamente.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Entrenador no encontrado.'], 404);
        } catch (\Exception $e) {
            \Log::error('Error syncPermissions: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al sincronizar permisos: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Asegura que los permisos requeridos existan en la base de datos para el guard 'staff'.
     */
    private function ensurePermissionsExist()
    {
        $permissions = [
            'acceder_nominas_admin',
            'acceder_facturacion',
            'crear_clases',
            'acceder_suscripciones',
            'acceder_estadisticas'
        ];

        foreach ($permissions as $name) {
            \Spatie\Permission\Models\Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'staff'
            ]);
        }

        // Asegurar que el rol admin los tenga todos
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')
            ->where('guard_name', 'staff')
            ->first();
            
        if ($adminRole) {
            foreach ($permissions as $p) {
                if (!$adminRole->hasPermissionTo($p, 'staff')) {
                    $adminRole->givePermissionTo($p);
                }
            }
        }
    }
}
