<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use App\Models\Entrenador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class AuthPasswordController extends Controller
{
    public function forgotForm()
    {
        return view('auth.forgot-password');
    }

    public function sendReset(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->email)->first();
        $broker = 'users';

        if (!$user) {
            $user = Entrenador::where('email', $request->email)->first();
            $broker = 'entrenadores';
        }

        if ($user) {
            $token = Password::broker($broker)->createToken($user);
            Mail::to($user->email)->send(new ResetPasswordMail($user, $token));
        }

        return back()->with('status', 'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.');
    }

    public function resetForm(string $token, Request $request)
    {
        return view('auth.reset-password', [
            'token' => $token,
            'email' => $request->query('email'),
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

        // Intentar con broker de usuarios
        $status = Password::broker('users')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->password = Hash::make($request->password);
                $user->save();
            }
        );

        // Si falla, intentar con broker de entrenadores
        if ($status !== Password::PASSWORD_RESET) {
            $status = Password::broker('entrenadores')->reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user) use ($request) {
                    $user->password = Hash::make($request->password);
                    $user->save();
                }
            );
        }

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('success', 'Contraseña actualizada. Ya puedes iniciar sesión.')
            : back()->withErrors(['email' => 'Token inválido o expirado.']);
    }
}
