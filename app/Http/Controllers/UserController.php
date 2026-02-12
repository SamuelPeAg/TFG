<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Entrenador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Array centralizado de mensajes de error en español.
     */
    protected function validationMessages()
    {
        return [
            'name.required'      => 'El nombre es obligatorio.',
            'name.string'        => 'El nombre debe ser un texto válido.',
            'name.min'           => 'El nombre debe tener al menos 3 caracteres.',
            'name.max'           => 'El nombre no puede superar los 255 caracteres.',
            
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.email'        => 'Introduce una dirección de correo válida.',
            'email.unique'       => 'Este correo ya está registrado por otro usuario.',
            
            'password.required'  => 'La contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe tener al menos 6 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            
            'iban.string'        => 'El iban debe ser un texto.',
            'iban.unique'        => 'Este iban ya pertenece a otro usuario.',
            'iban.min'           => 'El iban parece incompleto (mínimo 8 caracteres).',
            'iban.max'           => 'El IBAN no puede tener más de 34 caracteres.',
            
            'firma_digital.string' => 'La firma digital debe ser texto.',
            'firma_digital.max'    => 'La firma digital es demasiado larga.',
        ];
    }

    public function index()
    {
        // El modelo User ahora solo contiene clientes
        $users = User::all();
        return view('users.index', compact('users'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|min:3|max:50',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:6',
            'iban'          => 'nullable|string|unique:users,iban|min:15|max:34',
            'firma_digital' => 'nullable|string|max:255',
        ], $this->validationMessages());

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'iban' => $request->iban,
            'firma_digital' => $request->firma_digital,
        ]);

        // Sigue teniendo el rol cliente por si se usa Spatie para permisos
        $user->assignRole('cliente');

        return redirect()->route('users.index')->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'          => 'required|string|min:3|max:50',
            'email'         => 'required|email|unique:users,email,' . $user->id,
            'iban'          => 'nullable|string|min:8|max:34|unique:users,iban,' . $user->id,
            'firma_digital' => 'nullable|string|max:255',
        ], $this->validationMessages());

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'iban' => $request->iban,
            'firma_digital' => $request->firma_digital,
        ];

        if ($request->filled('password')) {
            $request->validate([
                'password' => 'string|min:6',
            ], $this->validationMessages());
            
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

        return redirect()->route('users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Usuario eliminado correctamente.');
    }

    public function configuracion(Request $request)
    {
        // Obtener el usuario de cualquiera de los dos guards
        $user = Auth::guard('entrenador')->user() ?: Auth::guard('web')->user();

        return view('configuracion.configuracion', [
            'user' => $user,
        ]);
    }

    public function updateConfiguracion(Request $request)
    {
        $user = Auth::guard('entrenador')->user() ?: Auth::guard('web')->user();
        
        if (!$user) {
            abort(403);
        }

        // Determinar tabla para validación de email único
        $table = ($user instanceof Entrenador) ? 'entrenadores' : 'users';

        $validated = $request->validate([
            'name'  => ['required', 'string', 'min:3', 'max:50'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique($table, 'email')->ignore($user->id),
            ],
            'iban' => [
                'nullable', 
                'string', 
                'min:15', 
                Rule::unique($table, 'iban')->ignore($user->id)
            ],
            'foto_de_perfil' => ['nullable', 'image', 'max:2048'], // Validar imagen (max 2MB)
            'firma_digital' => ['nullable', 'string', 'max:255'],
            'current_password' => ['nullable', 'string'],
            'password'         => ['nullable', 'string', 'min:6', 'confirmed'],
        ], $this->validationMessages());

        $data = [
            'name' => $validated['name'],
            'iban' => $validated['iban'] ?? $user->iban,
            'firma_digital' => $validated['firma_digital'] ?? $user->firma_digital,
            'email' => $user->email,
        ];

        if ($request->filled('password')) {
            $request->validate([
                'current_password' => ['required'],
            ], [
                'current_password.required' => 'Por seguridad, debes escribir tu contraseña actual para cambiarla.',
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