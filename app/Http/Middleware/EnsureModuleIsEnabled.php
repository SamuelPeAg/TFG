<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleIsEnabled
{
    /**
     * Intercepta la petición y comprueba si el módulo solicitado está activo en el plan.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $module Nombre de la clave del módulo en config('modules')
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        // Si el módulo está explícitamente desactivado, denegar acceso
        if (!config("modules.{$module}", true)) {
            
            // Si es petición API o AJAX, devolvemos error JSON 403
            if ($request->expectsJson() || $request->is('api/*') || $request->ajax()) {
                return response()->json([
                    'error' => 'Módulo no disponible en su suscripción.',
                    'module' => $module
                ], 403);
            }

            // Para navegación normal, redirigir al home/welcome con flash message
            return redirect()
                ->route('welcome')
                ->with('error', 'El módulo solicitado no está activo en su plan actual. Contacte con administración.');
        }

        return $next($request);
    }
}
