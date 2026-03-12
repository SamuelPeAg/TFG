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
    public function forgotForm(Request $request)
    {
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Endpoint para formulario forgot-password']);
        }
        return view('app');
    }

    public function sendReset(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Password::createToken($user);
            Mail::to($user->email)->send(new ResetPasswordMail($user, $token));
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.']);
        }

        return back()->with('status', 'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.');
    }

    public function resetForm(string $token, Request $request)
    {
        if ($request->wantsJson()) {
            return response()->json([
                'token' => $token,
                'email' => $request->query('email'),
            ]);
        }
        return view('app');
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
                $user->password = Hash::make($request->password);
                $user->save();
            }
        );

        if ($request->wantsJson()) {
            return $status === Password::PASSWORD_RESET
                ? response()->json(['success' => true, 'message' => 'Contraseña actualizada. Ya puedes iniciar sesión.'])
                : response()->json(['success' => false, 'message' => 'Token inválido o expirado.'], 400);
        }

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('success', 'Contraseña actualizada. Ya puedes iniciar sesión.')
            : back()->withErrors(['email' => 'Token inválido o expirado.']);
    }
}
