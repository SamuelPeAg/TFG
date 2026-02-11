<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Array centralizado de mensajes de error en español.
     * Así reutilizamos los mismos textos para crear y actualizar.
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
        // Mostrar solo clientes en la interfaz de usuarios
        $users = User::role('cliente')->get();
        

        return view('users.index', compact('users',));
    }

    public function store(Request $request)
    {
        // --- 1. VALIDACIONES ROBUSTAS (Mínimo 2 por campo) ---
        $request->validate([
            // Nombre: Obligatorio + Texto + Mínimo 3 letras + Máximo 255
            'name'          => 'required|string|min:3|max:50',
            
            // Email: Obligatorio + Formato email + Único en la tabla
            'email'         => 'required|email|unique:users,email',
            
            // Password: Obligatorio + Mínimo 6 caracteres
            'password'      => 'required|string|min:6',
            
            // iban: Opcional + Texto + Único + Mínimo 8 caracteres (validez básica)
            'iban'          => 'nullable|string|unique:users,iban|min:8|max:34',
            
            // Firma: Opcional + Texto + Máximo 255
            'firma_digital' => 'nullable|string|max:255',
        ], $this->validationMessages());

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'iban' => $request->iban,
            'firma_digital' => $request->firma_digital,
        ]);

        // Asignar rol cliente por defecto
        $user->assignRole('cliente');

        return redirect()->route('users.index')->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        // --- VALIDACIONES AL ACTUALIZAR ---
        $request->validate([
            'name'          => 'required|string|min:3|max:50',
            // Ignoramos el ID del usuario actual para que no falle el "unique"
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

        // Solo actualizar contraseña si se ha rellenado
        if ($request->filled('password')) {
            $request->validate([
                'password' => 'string|min:6', // Validamos también aquí
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



    //Metodos de configuración
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
            'name'  => ['required', 'string', 'min:3', 'max:50'],

            'iban' => [
                'nullable', 
                'string', 
                'string', 
                'min:8', 
                'max:34',
                Rule::unique('users', 'iban')->ignore($user->id)
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

        // Manejo de la subida de la imagen
        if ($request->hasFile('foto_de_perfil')) {
            // Eliminar imagen anterior si existe (opcional, buena práctica)
            /* if ($user->foto_de_perfil && \Storage::disk('public')->exists($user->foto_de_perfil)) {
                \Storage::disk('public')->delete($user->foto_de_perfil);
            } */
            
            // Guardar nueva imagen en 'profile-photos' dentro del disco 'public'
            $path = $request->file('foto_de_perfil')->store('profile-photos', 'public');
            $data['foto_de_perfil'] = $path;
        }

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