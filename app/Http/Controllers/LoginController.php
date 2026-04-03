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
        // Validación de las credenciales
        try {
            $credentials = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json($e->errors(), 422);
        }

        // 1. Intentar autenticar como Personal (Admin/Entrenador)
        if (Auth::guard('staff')->attempt($credentials)) {
            $request->session()->regenerate();
            $user = Auth::guard('staff')->user();
            
            return response()->json([
                'success' => true,
                'redirect' => route('calendario'),
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->hasRole('admin') ? 'admin' : 'entrenador',
                ]
            ]);
        }

        // 2. Intentar autenticar como Cliente
        if (Auth::guard('web')->attempt($credentials)) {
            $request->session()->regenerate();
            $user = Auth::guard('web')->user();

            return response()->json([
                'success' => true,
                'redirect' => route('welcome'),
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => 'cliente',
                ]
            ]);
        }

        // Si falla la autenticación en ambos
        return response()->json([
            'message' => 'Las credenciales no coinciden.',
            'errors' => [
                'general' => ['Correo electrónico o contraseña incorrectos.']
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
