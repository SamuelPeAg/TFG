<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Array centralizado de mensajes de error en español.
     * Así reutilizamos los mismos textos para crear y actualizar.
     */
    public function index()
    {
        // Mostrar solo clientes en la interfaz de usuarios
        $users = User::role('cliente', 'web')
            ->with(['suscripciones.suscripcion.centro', 'empresa', 'centro'])
            ->get();
        
        if (request()->wantsJson() || request()->ajax()) {
            return response()->json($users);
        }

        return view('app');
    }

    public function store(\App\Http\Requests\UserStoreRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'iban' => $request->iban,
            'firma_digital' => $request->firma_digital,
        ]);

        // Asignar rol cliente por defecto
        $user->assignRole('cliente');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Usuario creado correctamente.', 'user' => $user], 201);
        }

        return redirect()->route('users.index')->with('success', 'Usuario creado correctamente.');
    }

    public function update(\App\Http\Requests\UserUpdateRequest $request, User $user)
    {
        $data = $request->only(['name', 'iban', 'firma_digital', 'dni', 'codigo_postal']);

        // Solo actualizar contraseña si se ha rellenado
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Eliminar foto de perfil si se solicita
        if ($request->has('delete_profile_photo') && $request->delete_profile_photo == '1') {
            if ($user->foto_de_perfil) {
                $data['foto_de_perfil'] = null;
            }
        }

        $user->update($data);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Usuario actualizado correctamente.', 'user' => $user], 200);
        }

        return redirect()->route('users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        if (request()->wantsJson() || request()->ajax()) {
            return response()->json(['message' => 'Usuario eliminado correctamente.'], 200);
        }

        return redirect()->route('users.index')->with('success', 'Usuario eliminado correctamente.');
    }

    public function importClients(Request $request)
    {
        // Este método queda para compatibilidad o como fallback, pero usaremos el nuevo flujo
        set_time_limit(600);
        ini_set('memory_limit', '512M');

        try {
            $request->validate([
                'file' => 'required|file'
            ], [
                'file.required' => 'Debes seleccionar un archivo.'
            ]);

            $file = $request->file('file');
            $path = $file->getRealPath();
            $content = file_get_contents($path);
            
            // Limpiar BOM y caracteres raros
            $content = str_replace(["\xEF\xBB\xBF", "\x00"], '', $content);
            
            // Convertir codificación a UTF-8 si es necesario
            if (!mb_check_encoding($content, 'UTF-8')) {
                $content = mb_convert_encoding($content, 'UTF-8', 'ISO-8859-1');
            }
            
            // Separar por líneas
            $lines = preg_split('/\r\n|\r|\n/', $content);
            $lines = array_filter($lines, fn($line) => !empty(trim($line)));
            $lines = array_values($lines);

            if (empty($lines)) {
                return response()->json(['errors' => ['general' => 'El archivo está vacío.']], 422);
            }

            // Detectar delimitador y cabeceras
            $delimiter = null;
            $headers = [];
            $headerLineIndex = -1;

            foreach ($lines as $index => $line) {
                foreach ([',', ';', "\t", '|'] as $d) {
                    $cols = str_getcsv($line, $d);
                    $lineClean = mb_strtolower(implode('', $cols));
                    if (str_contains($lineClean, 'nombre') || str_contains($lineClean, 'centro') || str_contains($lineClean, 'completo')) {
                        $delimiter = $d;
                        $headers = array_map(fn($h) => str_replace([' ', '*', '(', ')', '.', ',', '_', '/'], '', mb_strtolower(trim($h))), $cols);
                        $headerLineIndex = $index;
                        break 2;
                    }
                }
            }

            if (!$delimiter) {
                $delimiter = (strpos($lines[0], ';') !== false) ? ';' : ',';
                $headers = array_map(fn($h) => str_replace([' ', '*', '(', ')', '.', ',', '_', '/'], '', mb_strtolower(trim($h))), str_getcsv($lines[0], $delimiter));
                $headerLineIndex = 0;
            }

            $count = 0;
            $empresa = \App\Models\Empresa::first();

            for ($i = $headerLineIndex + 1; $i < count($lines); $i++) {
                $data = str_getcsv($lines[$i], $delimiter);
                $rowData = [];
                foreach ($headers as $idx => $h) {
                    if (isset($data[$idx])) $rowData[$h] = trim($data[$idx]);
                }

                $nombre = null;
                foreach ($rowData as $key => $val) {
                    if (str_contains($key, 'nombre') || str_contains($key, 'cliente') || str_contains($key, 'completo')) {
                        $nombre = $val;
                        break;
                    }
                }
                
                if (empty($nombre)) continue;

                $emailRaw = $rowData['email'] ?? $rowData['correo'] ?? null;
                if (empty($emailRaw) || !filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) {
                    $email = str_replace(' ', '.', mb_strtolower($nombre)) . '-' . \Illuminate\Support\Str::random(4) . '@factomove.es';
                } else {
                    $email = $emailRaw;
                }
                
                $dni = $rowData['dni'] ?? null;
                if (empty(trim($dni))) $dni = null;

                $centroName = $rowData['centro'] ?? null;
                $centroId = null;
                if ($centroName) {
                    $centro = \App\Models\Centro::firstOrCreate([
                        'nombre' => $centroName,
                        'empresa_id' => $empresa ? $empresa->id : null
                    ]);
                    $centroId = $centro->id;
                }

                $userData = [
                    'name'      => $nombre,
                    'email'     => $email,
                    'dni'       => $dni,
                    'direccion' => $rowData['domicilio'] ?? $rowData['direccion'] ?? $rowData['street'] ?? null,
                    'centro_id' => $centroId,
                    'empresa_id' => $empresa ? $empresa->id : null,
                    'activo'    => false, 
                    'additional_attributes' => [
                        'apodo' => $rowData['apodo'] ?? null,
                        'mv'    => $rowData['mv'] ?? $rowData['movil'] ?? null,
                        'birthday' => $rowData['cumpleaños'] ?? $rowData['birthday'] ?? null,
                    ]
                ];

                $user = User::where('email', $email)->orWhere(function($q) use ($dni) {
                    if ($dni) $q->where('dni', $dni); else $q->whereRaw('0=1');
                })->first();

                if ($user) {
                    $user->update($userData);
                } else {
                    $user = User::create($userData + [
                        'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(16))
                    ]);
                    $user->assignRole('cliente');
                }
                $count++;
            }

            if (count($lines) > 0 && str_starts_with($lines[0], 'PK')) {
                return response()->json([
                    'errors' => ['general' => 'AVISO: Tu archivo es realmente un "Libro de Excel (.xlsx)" aunque la extensión diga .csv. Por favor, ábrelo en Excel y dale a "Guardar como... > CSV (delimitado por comas)" antes de subirlo.']
                ], 422);
            }

            if ($count === 0) {
                return response()->json([
                    'errors' => ['general' => "DIAGNÓSTICO: 0 filas. Delim: [$delimiter]. Headers: [" . implode(', ', $headers) . "]."]
                ], 422);
            }

            return response()->json(['message' => "Se han importado $count clientes con éxito."]);

        } catch (\Exception $e) {
            \Log::error('Error import: ' . $e->getMessage());
            return response()->json(['errors' => ['general' => 'Error: ' . $e->getMessage()]], 422);
        }
    }

    public function importPrepare(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file'
            ], [
                'file.required' => 'Debes seleccionar un archivo.'
            ]);

            $file = $request->file('file');
            $path = $file->getRealPath();
            $content = file_get_contents($path);
            
            $content = str_replace(["\xEF\xBB\xBF", "\x00"], '', $content);
            if (!mb_check_encoding($content, 'UTF-8')) {
                $content = mb_convert_encoding($content, 'UTF-8', 'ISO-8859-1');
            }
            
            $lines = preg_split('/\r\n|\r|\n/', $content);
            $lines = array_filter($lines, fn($line) => !empty(trim($line)));
            $lines = array_values($lines);

            if (empty($lines)) {
                return response()->json(['errors' => ['general' => 'El archivo está vacío.']], 422);
            }

            if (str_starts_with($lines[0], 'PK')) {
                 return response()->json(['errors' => ['general' => 'AVISO: Tu archivo es realmente un "Libro de Excel (.xlsx)" aunque la extensión diga .csv. Por favor, ábrelo en Excel y dale a "Guardar como... > CSV (delimitado por comas)" antes de subirlo.']], 422);
            }

            $delimiter = null;
            $headers = [];
            $headerLineIndex = -1;

            foreach ($lines as $index => $line) {
                foreach ([',', ';', "\t", '|'] as $d) {
                    $cols = str_getcsv($line, $d);
                    $lineClean = mb_strtolower(implode('', $cols));
                    if (str_contains($lineClean, 'nombre') || str_contains($lineClean, 'centro') || str_contains($lineClean, 'completo')) {
                        $delimiter = $d;
                        $headers = array_map(fn($h) => str_replace([' ', '*', '(', ')', '.', ',', '_', '/'], '', mb_strtolower(trim($h))), $cols);
                        $headerLineIndex = $index;
                        break 2;
                    }
                }
            }

            if (!$delimiter) {
                $delimiter = (strpos($lines[0], ';') !== false) ? ';' : ',';
                $headers = array_map(fn($h) => str_replace([' ', '*', '(', ')', '.', ',', '_', '/'], '', mb_strtolower(trim($h))), str_getcsv($lines[0], $delimiter));
                $headerLineIndex = 0;
            }

            $rows = [];
            for ($i = $headerLineIndex + 1; $i < count($lines); $i++) {
                $data = str_getcsv($lines[$i], $delimiter);
                $rowData = [];
                foreach ($headers as $idx => $h) {
                    if (isset($data[$idx])) $rowData[$h] = trim($data[$idx]);
                }
                $rows[] = $rowData;
            }

            return response()->json([
                'rows' => $rows,
                'total' => count($rows)
            ]);

        } catch (\Exception $e) {
            return response()->json(['errors' => ['general' => 'Error: ' . $e->getMessage()]], 422);
        }
    }

    public function importProcessRow(Request $request)
    {
        try {
            $rowData = $request->all();
            $empresa = \App\Models\Empresa::first();

            $nombre = null;
            foreach ($rowData as $key => $val) {
                if (str_contains($key, 'nombre') || str_contains($key, 'cliente') || str_contains($key, 'completo')) {
                    $nombre = $val;
                    break;
                }
            }
            
            if (empty($nombre)) {
                return response()->json(['status' => 'skipped', 'message' => 'Fila sin nombre']);
            }

            $emailRaw = $rowData['email'] ?? $rowData['correo'] ?? null;
            if (empty($emailRaw) || !filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) {
                $email = str_replace(' ', '.', mb_strtolower($nombre)) . '-' . \Illuminate\Support\Str::random(4) . '@factomove.es';
            } else {
                $email = $emailRaw;
            }
            
            $dni = $rowData['dni'] ?? null;
            if (empty(trim($dni))) $dni = null;

            $centroName = $rowData['centro'] ?? null;
            $centroId = null;
            if ($centroName) {
                $centro = \App\Models\Centro::firstOrCreate([
                    'nombre' => $centroName,
                    'empresa_id' => $empresa ? $empresa->id : null
                ]);
                $centroId = $centro->id;
            }

            $userData = [
                'name'      => $nombre,
                'email'     => $email,
                'dni'       => $dni,
                'direccion' => $rowData['domicilio'] ?? $rowData['direccion'] ?? $rowData['street'] ?? null,
                'centro_id' => $centroId,
                'empresa_id' => $empresa ? $empresa->id : null,
                'activo'    => false, 
                'additional_attributes' => [
                    'apodo' => $rowData['apodo'] ?? null,
                    'mv'    => $rowData['mv'] ?? $rowData['movil'] ?? null,
                    'birthday' => $rowData['cumpleaños'] ?? $rowData['birthday'] ?? null,
                ]
            ];

            $user = User::where('email', $email)->orWhere(function($q) use ($dni) {
                if ($dni) $q->where('dni', $dni); else $q->whereRaw('0=1');
            })->first();

            if ($user) {
                $user->update($userData);
                $action = 'updated';
            } else {
                $user = User::create($userData + [
                    'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(16))
                ]);
                $user->assignRole('cliente');
                $action = 'created';
            }

            return response()->json([
                'status' => 'success',
                'action' => $action,
                'name' => $nombre
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 422);
        }
    }


    //Metodos de configuración
    public function configuracion(Request $request)
    {
        if ($request->wantsJson()) {
            $user = null;
            if (auth('staff')->check()) {
                $user = auth('staff')->user();
                $user->role = $user->hasRole('admin') ? 'admin' : 'entrenador';
                $user->permissions = $user->hasRole('admin') ? ['*'] : $user->getAllPermissions()->pluck('name')->toArray();
            } elseif (auth('web')->check()) {
                $user = auth('web')->user();
                $user->role = 'cliente';
                $user->permissions = [];
            }
            return response()->json(['user' => $user]);
        }
        return view('app');
    }

    public function updateConfiguracion(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => ['required', 'string', 'min:3', 'max:50', 'regex:/^[\pL\s.\-]+$/u'],
            'dni'   => ['nullable', 'string', 'regex:/^[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]$/i'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'ciudad'    => ['nullable', 'string', 'max:100'],
            'codigo_postal' => ['nullable', 'string', 'regex:/^[0-9]{5}$/'],
            'iban' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    $cleanIban = strtoupper(str_replace(' ', '', $value));
                    
                    // Caso España: ES + 22 números
                    if (str_starts_with($cleanIban, 'ES')) {
                        if (strlen($cleanIban) !== 24) {
                            $fail('El IBAN español debe tener exactamente 24 caracteres (ES seguido de 22 números).');
                            return;
                        }
                        if (!ctype_digit(substr($cleanIban, 2))) {
                            $fail('El IBAN español no puede contener letras después del código de país "ES". Debe ser ES seguido de 22 números.');
                            return;
                        }
                    } else {
                        // Caso Internacional General
                        if (!preg_match('/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/', $cleanIban)) {
                            $fail('El formato del IBAN internacional no es válido. Debe comenzar con 2 letras de país, 2 dígitos de control y entre 11 y 30 caracteres alfanuméricos.');
                        }
                    }
                },
                Rule::unique($user->getTable(), 'iban')->ignore($user->id)
            ],
            'foto_de_perfil' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'firma_digital' => ['nullable', 'string', 'max:500'],
            'current_password' => ['nullable', 'string', 'max:64'],
            'password'         => ['nullable', 'string', 'min:6', 'max:64', 'confirmed'],
        ], [
            'name.max' => 'El nombre no puede exceder los 50 caracteres.',
            'name.regex' => 'El nombre solo puede contener letras, espacios, puntos o guiones.',
            'current_password.required' => 'Por seguridad, debes escribir tu contraseña actual para cambiarla.',
            'password.confirmed' => 'La confirmación de la nueva contraseña no coincide.',
        ]);

        $data = [
            'name' => $validated['name'],
            'dni'  => $validated['dni'] ?? $user->dni,
            'direccion' => $validated['direccion'] ?? $user->direccion,
            'ciudad' => $validated['ciudad'] ?? $user->ciudad,
            'codigo_postal' => $validated['codigo_postal'] ?? $user->codigo_postal,
            'iban' => $validated['iban'] ?? $user->iban,
            'firma_digital' => $validated['firma_digital'] ?? $user->firma_digital,
            'email' => $user->email,
        ];

        // Limpiar alertas de campo si se han actualizado
        $fields = ['dni', 'direccion', 'ciudad', 'codigo_postal', 'iban'];
        foreach ($fields as $field) {
            if (isset($validated[$field]) && $validated[$field] !== $user->$field) {
                UserNotification::where('user_id', $user->id)
                    ->where('type', 'field_alert')
                    ->where('field', $field)
                    ->delete();
            }
        }

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
                if ($request->wantsJson()) {
                    return response()->json(['errors' => ['current_password' => ['La contraseña actual no es correcta.']]], 422);
                }
                return back()
                    ->withErrors(['current_password' => 'La contraseña actual no es correcta.'])
                    ->withInput();
            }

            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Configuración actualizada correctamente.', 'user' => $user]);
        }

        return back()->with('success', 'Configuración actualizada correctamente.');
    }

    public function sendActivation(User $user)
    {
        // Generar un token único y establecer su expiración (ahora + 24 horas)
        $user->activation_token = \Illuminate\Support\Str::random(60);
        $user->activation_token_expires_at = now()->addDay();
        $user->save();

        // Generar la URL de activación
        $url = route('activate.show', ['token' => $user->activation_token]);

        try {
            // Usar la mailable ActivationEmail recientemente creada
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\ActivationEmail($user, $url));
            
            return response()->json(['message' => 'Correo de activación enviado correctamente.']);
        } catch (\Exception $e) {
            \Log::error('Error sending activation mail: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al enviar el correo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bulkSendActivation(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();
        $sentCount = 0;
        $errorCount = 0;

        foreach ($users as $user) {
            $user->activation_token = \Illuminate\Support\Str::random(60);
            $user->activation_token_expires_at = now()->addDay();
            $user->save();
            $url = route('activate.show', ['token' => $user->activation_token]);
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\ActivationEmail($user, $url));
                $sentCount++;
            } catch (\Exception $e) {
                \Log::error('Error sending bulk activation mail for user ' . $user->id . ': ' . $e->getMessage());
                $errorCount++;
            }
        }

        return response()->json([
            'message' => "Correos enviados: $sentCount. Errores: $errorCount."
        ]);
    }

    public function showActivationForm($token)
    {
        // Buscar al usuario por el token y verificar que no haya expirado
        $user = User::where('activation_token', $token)
            ->where('activation_token_expires_at', '>', now())
            ->first();

        if (!$user) {
            return redirect('/login')->with('error', 'El enlace de activación es inválido o ha expirado.');
        }

        // Simplemente devolvemos la vista de React (app)
        return view('app');
    }

    public function activate(Request $request, $token)
    {
        // Buscar el usuario y validar vigencia del token
        $user = User::where('activation_token', $token)
            ->where('activation_token_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['errors' => ['general' => 'El enlace ha expirado o no es válido.']], 422);
        }

        // Validación de contraseña
        $request->validate([
            'password' => 'required|string|min:6|max:64|confirmed'
        ], [
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'password.max' => 'La contraseña es excesivamente larga.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        // Actualizar contraseña, activar cuenta y limpiar token
        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'activo' => true,
            'activation_token' => null,
            'activation_token_expires_at' => null,
            'email_verified_at' => now(),
        ]);

        return response()->json(['message' => 'Cuenta activada correctamente. Ya puedes iniciar sesión.']);
    }
}