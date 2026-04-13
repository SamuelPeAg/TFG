<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class AuthPasswordController extends Controller
{

    public function sendReset(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Password::createToken($user);
            Mail::to($user->email)->send(new ResetPasswordMail($user, $token));
        }

        // Siempre devolver éxito por seguridad (aunque no exista el usuario)
        return response()->json([
            'message' => 'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.'
        ]);
    }


    public function updatePassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', 'min:8'],
        ], [
            'password.required'  => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password)
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada. Ya puedes iniciar sesión.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Token inválido o expirado.'
        ], 422);
    }
}
