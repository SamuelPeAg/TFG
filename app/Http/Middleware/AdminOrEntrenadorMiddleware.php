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

        if ($user->hasRole('admin')) {
            return $next($request);
        }

        if ($user->hasRole('entrenador')) {
            $path = $request->path();

            // Rutas de Facturación
            if (str_contains($path, 'facturas') && !$user->can('acceder_facturacion')) {
                abort(403, 'No tienes permiso para acceder a Facturación.');
            }

            // Rutas de Suscripciones
            if (str_contains($path, 'suscripciones') && !$user->can('acceder_suscripciones')) {
                abort(403, 'No tienes permiso para acceder a Suscripciones.');
            }

            return $next($request);
        }

        abort(403, 'Acceso prohibido: se requiere rol admin o entrenador con permisos.');

        abort(403, 'Acceso prohibido: se requiere rol admin o entrenador.');
    }
}
