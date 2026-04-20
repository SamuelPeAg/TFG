<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Entrenador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Redirige al usuario a la página de autenticación de Google.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->scopes(['https://www.googleapis.com/auth/calendar'])
            ->with(['access_type' => 'offline', 'prompt' => 'consent'])
            // Usamos route() para que sea dinámico según el entorno (local o producción)
            ->redirectUrl(route('google.callback'))
            ->redirect();
    }

    /**
     * Maneja el callback de Google.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            // Es importante usar el mismo redirectUrl que en la redirección inicial
            $googleUser = Socialite::driver('google')
                ->redirectUrl(route('google.callback'))
                ->user();
            
            Log::info('Google OAuth Callback exitoso', ['email' => $googleUser->email]);

        } catch (\Exception $e) {
            Log::error('Error en Google OAuth Callback', ['error' => $e->getMessage()]);
            return redirect('/login')->with('error', 'Error al autenticar con Google: ' . $e->getMessage());
        }

        // 1. Buscar primero en la tabla de Clientes (User)
        $user = User::where('email', $googleUser->email)->first();
        if ($user) {
            // Verificamos si el usuario está activo
            if (!$user->activo) {
                return redirect('/login')->with('error', 'Tu cuenta de cliente está desactivada. Contacta con el administrador.');
            }

            $user->update([
                'google_id' => $googleUser->id,
                'google_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken ?? $user->google_refresh_token,
                'google_token_expires_at' => now()->addSeconds($googleUser->expiresIn),
            ]);

            $request->session()->regenerate();
            Auth::guard('web')->login($user);
            
            Log::info('Cliente logueado con Google', ['id' => $user->id]);
            return redirect('/mis-clases');
        }

        // 2. Si no es un cliente, buscar en la tabla de Staff (Entrenador)
        $staff = Entrenador::where('email', $googleUser->email)->first();
        if ($staff) {
            // Verificamos si el staff está activo
            if (!$staff->activo) {
                return redirect('/login')->with('error', 'Tu cuenta de personal está desactivada.');
            }

            $staff->update([
                'google_id' => $googleUser->id,
                'google_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken ?? $staff->google_refresh_token,
                'google_token_expires_at' => now()->addSeconds($googleUser->expiresIn),
            ]);

            $request->session()->regenerate();
            Auth::guard('staff')->login($staff);
            
            Log::info('Staff logueado con Google', ['id' => $staff->id]);

            // Redirigir según el rol de staff
            if ($staff->hasRole('admin')) {
                return redirect('/estadisticas');
            }
            return redirect('/calendario');
        }

        // Si el email no existe en ninguna tabla, llevamos a REGISTRO con mensaje claro
        Log::warning('Intento de Google Login con email no registrado', ['email' => $googleUser->email]);
        
        return redirect('/register?email=' . $googleUser->email)
            ->with('error', 'Antes de iniciar sesión con Google para el correo ' . $googleUser->email . ', debes crear una cuenta manualmente. Una vez creada, podrás entrar con Google siempre que quieras.');
    }
}
