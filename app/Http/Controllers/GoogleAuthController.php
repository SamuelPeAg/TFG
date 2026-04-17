<?php

namespace App\Http\Controllers;

use App\Models\User;
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

        // RESTRICCIÓN: Solo permitir usuarios que ya existan en la base de datos por su email
        $user = User::where('email', $googleUser->email)->first();

        if ($user) {
            // Si el usuario existe, actualizamos sus credenciales de Google
            // (Esto vincula la cuenta de Google con el usuario de Laravel automáticamente)
            $user->update([
                'google_id' => $googleUser->id,
                'google_token' => $googleUser->token,
                // El refresh token solo llega la primera vez que se da consentimiento
                'google_refresh_token' => $googleUser->refreshToken ?? $user->google_refresh_token,
                'google_token_expires_at' => now()->addSeconds($googleUser->expiresIn),
            ]);

            Auth::login($user);
            return redirect('/calendario');
        }

        // Si el usuario no existe, denegamos el acceso
        return redirect('/login')->with('error', 'Tu email (' . $googleUser->email . ') no está registrado en el sistema. Contacta con el administrador.');
    }
}
