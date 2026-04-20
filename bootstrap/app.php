<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions) {
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

