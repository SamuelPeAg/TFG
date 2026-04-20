<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use function Ramsey\Uuid\v1;

class LoginController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

    }
    public function login(Request $request)
    {
        // 1. Validación de las credenciales
        try {
            $credentials = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json($e->errors(), 422);
        }

        try {
            // 2. Intentar autenticar como Personal (Admin/Entrenador)
            $staffCredentials = array_merge($credentials, ['activo' => true]);
            if (Auth::guard('staff')->attempt($staffCredentials)) {
                $request->session()->regenerate();
                $user = Auth::guard('staff')->user();
                
                return response()->json([
                    'success' => true,
                    'redirect' => $user->hasRole('admin') ? route('estadisticas.index') : route('calendario'),
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role' => $user->hasRole('admin') ? 'admin' : 'entrenador',
                        'permissions' => ($user->hasRole('admin')) ? ['*'] : $user->getAllPermissions()->pluck('name')->toArray()
                    ]
                ]);
            }

            // 3. Intentar autenticar como Cliente (Solo si está ACTIVO)
            // Al añadir 'activo' => true, Laravel solo permitirá el login si la columna activo es 1.
            $clientCredentials = array_merge($credentials, ['activo' => true]);
            if (Auth::guard('web')->attempt($clientCredentials)) {
                $request->session()->regenerate();
                $user = Auth::guard('web')->user();

                return response()->json([
                    'success' => true,
                    'redirect' => route('mis_clases'),
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role' => 'cliente',
                    ]
                ]);
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // Capturamos errores de base de datos (como tablas faltantes)
            return response()->json([
                'message' => 'Error de conexión con el servidor.',
                'errors' => [
                    'general' => ['No se pudo conectar con la base de datos. Verifica tu conexión o contacta con soporte técnico. (Error: BD1)']
                ]
            ], 500);
        } catch (\Exception $e) {
            // Error genérico
            return response()->json([
                'message' => 'Error inesperado del servidor.',
                'errors' => [
                    'general' => ['Hubo un problema procesando tu solicitud.']
                ]
            ], 500);
        }

        // Si falla la autenticación en ambos (porque las credenciales no coinciden)
        return response()->json([
            'message' => 'Las credenciales no coinciden.',
            'errors' => [
                'general' => ['El correo electrónico o la contraseña son incorrectos.']
            ]
        ], 422);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
