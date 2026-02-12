<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrEntrenadorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || ! method_exists($user, 'hasRole')) {
            abort(403, 'Acceso prohibido.');
        }

        if ($user->hasRole('admin') || $user->hasRole('entrenador')) {
            return $next($request);
        }

        abort(403, 'Acceso prohibido: se requiere rol admin o entrenador.');
    }
}
