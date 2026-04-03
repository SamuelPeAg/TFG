<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use Illuminate\Support\Facades\Auth;

class AdminOrEntrenadorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('staff')->user();

        if (! $user) {
            abort(403, 'Acceso prohibido.');
        }

        if ($user->hasRole('admin') || $user->hasRole('entrenador')) {
            return $next($request);
        }

        abort(403, 'Acceso prohibido: se requiere rol admin o entrenador.');
    }
}
