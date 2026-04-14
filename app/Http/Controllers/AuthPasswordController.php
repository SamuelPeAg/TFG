<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Validation\Rules\Password;

class AuthPasswordController extends Controller
{

    public function sendReset(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        // 1. Buscar en Clientes
        $user = User::where('email', $request->email)->first();
        $broker = 'users';

        // 2. Si no es cliente, buscar en Entrenadores
        if (!$user) {
            $user = \App\Models\Entrenador::where('email', $request->email)->first();
            $broker = 'staff';
        }

        if ($user) {
            // El createToken de Laravel ya sabe qué tabla usar según el broker
            $token = PasswordBroker::broker($broker)->createToken($user);
            
            try {
                Mail::to($user->email)->send(new ResetPasswordMail($user, $token));
            } catch (\Exception $e) {
                \Log::error("Error en envío de email de recuperación: " . $e->getMessage());
                // Por seguridad devolvemos éxito igualmente, pero logueamos el fallo interno
            }
        }

        // Siempre devolver éxito por seguridad (aunque no exista el perfil)
        return response()->json([
            'message' => 'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.'
        ]);
    }


    public function updatePassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->numbers()
                    ->mixedCase()
                    ->symbols()
            ],
        ], [
            'password.required'  => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password'           => 'La contraseña debe tener al menos 8 caracteres e incluir letras (mayúsculas y minúsculas), números y símbolos.',
        ]);

        $credentials = $request->only('email', 'password', 'password_confirmation', 'token');

        // 1. Intentar con el broker de Clientes
        $status = PasswordBroker::broker('users')->reset(
            $credentials,
            function ($user) use ($request) {
                $user->forceFill(['password' => Hash::make($request->password)])->save();
            }
        );

        // 2. Si falló porque el usuario no existe en 'users', intentar con 'staff'
        if ($status === PasswordBroker::INVALID_USER) {
            $status = PasswordBroker::broker('staff')->reset(
                $credentials,
                function ($user) use ($request) {
                    $user->forceFill(['password' => Hash::make($request->password)])->save();
                }
            );
        }

        if ($status === PasswordBroker::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada. Ya puedes iniciar sesión.'
            ]);
        }

        // Determinar mensaje de error
        $message = 'Token inválido o expirado.';
        if ($status === PasswordBroker::INVALID_USER) $message = 'No hemos encontrado un perfil con este correo.';
        if ($status === PasswordBroker::INVALID_PASSWORD) $message = 'La contraseña es inválida.'; // No debería ocurrir aquí por el validator

        return response()->json([
            'success' => false,
            'message' => $message
        ], 422);
    }
}
