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

            // Rutas de Suscripciones (Catálogo)
            // Bloqueamos el acceso al panel web (GET no-ajax) y modificaciones (POST, PUT, DELETE) 
            // a la ruta /suscripciones si no tiene el permiso.
            // Permitimos /suscripciones-usuarios y GET ajax a /suscripciones para que los entrenadores puedan vincular planes a clientes.
            if ($request->is('suscripciones') || $request->is('suscripciones/*')) {
                if (in_array($request->method(), ['POST', 'PUT', 'DELETE']) && !$user->can('acceder_suscripciones')) {
                    abort(403, 'No tienes permiso para modificar el catálogo de Suscripciones.');
                }
                if ($request->method() === 'GET' && !$request->ajax() && !$request->wantsJson() && !$user->can('acceder_suscripciones')) {
                    abort(403, 'No tienes permiso para acceder al panel de Suscripciones.');
                }
            }

            return $next($request);
        }

        abort(403, 'Acceso prohibido: se requiere rol admin o entrenador con permisos.');

        abort(403, 'Acceso prohibido: se requiere rol admin o entrenador.');
    }
}
