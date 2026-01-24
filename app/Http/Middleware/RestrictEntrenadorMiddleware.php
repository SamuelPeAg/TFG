<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictEntrenadorMiddleware
{
    /**
     * If the authenticated user has role 'entrenador', allow only certain paths.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('entrenador')) {
            // Normalizar sin slashes al inicio
            $allowedPrefixes = [
                'users',
                'Pagos',
                'usuarios/reservas',
                'logout',
                'calendario', // Permitir calendario
            ];

            $path = ltrim($request->path(), '/');

            foreach ($allowedPrefixes as $prefix) {
                if (str_starts_with($path, $prefix)) {
                    return $next($request);
                }
            }

            // No coincide con ninguno de los prefijos permitidos
            abort(403, 'Acceso prohibido para rol entrenador.');
        }

        return $next($request);
    }
}
