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
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ]);

    // Intentar autenticar usando el modelo User
    if (Auth::attempt($credentials)) {
        // Regenerar sesión para mayor seguridad
        $request->session()->regenerate();

        // Redirigir al dashboard o la ruta que desees después de iniciar sesión
        return redirect()->intended('/users');
    }

    // Si falla la autenticación
    return back()->withErrors([
        'email' => 'Las credenciales no son correctas.',
    ])->onlyInput('email');
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
