<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('staff')->user();
        
        if (! $user) {
            abort(403, 'Acceso prohibido.');
        }

        // Si es admin, pasa siempre
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Si es entrenador, verificar permisos específicos según la ruta
        if ($user->hasRole('entrenador')) {
            $path = $request->path();
            
            if (str_contains($path, 'admin/nominas') && $user->can('acceder_nominas_admin')) {
                return $next($request);
            }
            
            if (str_contains($path, 'estadisticas') && $user->can('acceder_estadisticas')) {
                return $next($request);
            }
        }

        abort(403, 'Acceso prohibido: se requiere rol admin o permisos específicos.');

        return $next($request);
    }
}
