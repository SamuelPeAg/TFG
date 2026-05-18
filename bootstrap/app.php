<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\TrustProxies::class);
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->context(function () {
            $user = auth('web')->user() ?? auth('staff')->user();
            return array_filter([
                'user_id' => $user ? $user->id : null,
                'user_role' => $user ? $user->role : 'invitado',
                'user_name' => $user ? $user->name : 'Anónimo',
                'url' => request()->fullUrl(),
            ]);
        });

        $exceptions->render(function (\Illuminate\Database\QueryException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Error de conexión con la base de datos.',
                    'errors' => [
                        'general' => ['Error de sistema: ' . $e->getMessage()]
                    ]
                ], 500);
            }
        });
    })->create();

