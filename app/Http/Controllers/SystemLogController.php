<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SystemLogController extends Controller
{
    /**
     * Devuelve los últimos errores del archivo laravel.log
     */
    public function index(Request $request)
    {
        $logFile = storage_path('logs/laravel.log');
        $logs = [];

        if (File::exists($logFile)) {
            $content = File::get($logFile);
            
            $pattern = '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (.*?)\.(ERROR|CRITICAL|EMERGENCY|WARNING): (.*?)(?=\n^\[|\z)/ms';
            
            preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

            $matches = array_reverse($matches);

            // Pagination parameters
            $page = (int) $request->input('page', 1);
            $perPage = (int) $request->input('per_page', 20);
            $total = count($matches);
            $offset = ($page - 1) * $perPage;

            // Limit and offset
            $paginatedMatches = array_slice($matches, $offset, $perPage);

            foreach ($paginatedMatches as $match) {
                $rawMessage = trim($match[4]);
                
                $url = null;
                $user = null;
                $role = null;
                $source = 'BACKEND';
                $message = $rawMessage;

                if (str_starts_with($rawMessage, 'FRONTEND [')) {
                    $source = 'FRONTEND';
                    if (preg_match('/FRONTEND \[(.*?)\] \| URL: (.*?) \| Error: (.*?)(?: \| Stack:|$)/s', $rawMessage, $frontMatch)) {
                        $userInfoStr = $frontMatch[1];
                        $url = trim($frontMatch[2]);
                        
                        if (preg_match('/Usuario: (.*?) \(Rol: (.*?), ID: (.*?)\)/', $userInfoStr, $uMatch)) {
                            $user = $uMatch[1];
                            $role = $uMatch[2];
                        } else {
                            $user = $userInfoStr;
                        }

                        $message = trim($frontMatch[3]);
                        if (str_contains($rawMessage, ' | Stack:')) {
                            $message .= "\n\nStack:\n" . trim(substr($rawMessage, strpos($rawMessage, ' | Stack:') + 10));
                        }
                    }
                } else {
                    if (preg_match('/(\{.*?"user_role":.*?"url":.*?\})\s*$/s', $rawMessage, $ctxMatch)) {
                        $ctx = json_decode($ctxMatch[1], true);
                        if ($ctx) {
                            $user = $ctx['user_name'] ?? 'Anónimo';
                            $role = $ctx['user_role'] ?? 'invitado';
                            $url = $ctx['url'] ?? null;
                            $message = trim(str_replace($ctxMatch[1], '', $rawMessage));
                        }
                    }
                }

                $logs[] = [
                    'date' => $match[1],
                    'environment' => $match[2],
                    'level' => $match[3],
                    'source' => $source,
                    'user' => $user,
                    'role' => $role,
                    'url' => $url,
                    'message' => $message
                ];
            }
        }

        return response()->json([
            'success' => true,
            'logs' => $logs,
            'pagination' => [
                'total' => $total ?? 0,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => isset($total) ? ceil($total / $perPage) : 1
            ]
        ]);
    }

    /**
     * Limpia el archivo de logs
     */
    public function clear()
    {
        $logFile = storage_path('logs/laravel.log');
        
        if (File::exists($logFile)) {
            File::put($logFile, ''); // Vaciar archivo
        }

        return response()->json([
            'success' => true,
            'message' => 'Registro de errores limpiado correctamente.'
        ]);
    }

    /**
     * Registra un error proveniente del frontend (React)
     */
    public function logClientError(Request $request)
    {
        // Intentar obtener el usuario (puede ser cliente o staff)
        $user = auth('web')->user() ?? auth('staff')->user();
        $userInfo = $user ? "Usuario: {$user->name} (Rol: {$user->role}, ID: {$user->id})" : "Visitante Anónimo";
        
        $errorMsg = $request->input('message', 'Error desconocido en frontend');
        $stack = $request->input('stack', '');
        $url = $request->input('url', url()->current());
        $level = strtoupper($request->input('level', 'ERROR')); // Puede ser WARNING, ERROR, CRITICAL
        
        $logText = "FRONTEND [{$userInfo}] | URL: {$url} | Error: {$errorMsg} | Stack: " . substr($stack, 0, 300);

        if ($level === 'CRITICAL') {
            \Illuminate\Support\Facades\Log::critical($logText);
        } else if ($level === 'WARNING') {
            \Illuminate\Support\Facades\Log::warning($logText);
        } else {
            \Illuminate\Support\Facades\Log::error($logText);
        }

        return response()->json(['success' => true]);
    }
}
