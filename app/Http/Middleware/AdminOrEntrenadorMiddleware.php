<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrEntrenadorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si el usuario está autenticado en el guard 'entrenador'
        $user = auth('entrenador')->user();

        if ($user && ($user->hasRole('admin') || $user->hasRole('entrenador'))) {
            return $next($request);
        }

        abort(403, 'Acceso prohibido: se requiere rol admin o entrenador.');
    }
}
