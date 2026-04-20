<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Entrenador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
    public function handleGoogleCallback()
    {
        try {
            // Es importante usar el mismo redirectUrl que en la redirección inicial
            $googleUser = Socialite::driver('google')
                ->redirectUrl(route('google.callback'))
                ->user();
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Error al autenticar con Google: ' . $e->getMessage());
        }

        // 1. Buscar primero en la tabla de Clientes (User)
        $user = User::where('email', $googleUser->email)->first();
        if ($user) {
            $user->update([
                'google_id' => $googleUser->id,
                'google_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken ?? $user->google_refresh_token,
                'google_token_expires_at' => now()->addSeconds($googleUser->expiresIn),
            ]);

            Auth::guard('web')->login($user);
            return redirect('/mis-clases');
        }

        // 2. Si no es un cliente, buscar en la tabla de Staff (Entrenador)
        $staff = Entrenador::where('email', $googleUser->email)->first();
        if ($staff) {
            $staff->update([
                'google_id' => $googleUser->id,
                'google_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken ?? $staff->google_refresh_token,
                'google_token_expires_at' => now()->addSeconds($googleUser->expiresIn),
            ]);

            Auth::guard('staff')->login($staff);
            
            // Redirigir según el rol de staff
            if ($staff->hasRole('admin')) {
                return redirect('/estadisticas');
            }
            return redirect('/calendario');
        }

        // Si el email no existe en ninguna tabla, denegamos el acceso
        return redirect('/login')->with('error', 'Tu email (' . $googleUser->email . ') no está registrado en el sistema. Contacta con el administrador.');
    }
}
