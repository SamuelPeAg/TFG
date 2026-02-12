<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si el usuario está autenticado en el guard 'entrenador'
        $user = auth('entrenador')->user();

        if (! $user || ! $user->hasRole('admin')) {
            abort(403, 'Acceso prohibido: se requiere rol admin.');
        }

        return $next($request);
    }
}
