<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SystemLogController extends Controller
{
    /**
     * Devuelve los últimos errores del archivo de log actual
     */
    public function index(Request $request)
    {
        $logChannel = config('logging.default');
        if ($logChannel === 'daily') {
            $logFile = storage_path('logs/laravel-' . date('Y-m-d') . '.log');
        } else {
            $logFile = storage_path('logs/laravel.log');
        }

        $logs = [];
        $total = 0;
        $perPage = (int) $request->input('per_page', 20);
        $page = (int) $request->input('page', 1);

        if (File::exists($logFile)) {
            // Leer el archivo de forma eficiente desde el final
            $content = $this->readLastEntries($logFile, 500000); // Leer los últimos 500KB para procesar
            
            // Regex mejorada para capturar el mensaje y opcionalmente el stack trace (primeras líneas)
            $pattern = '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (.*?)\.(ERROR|CRITICAL|EMERGENCY|WARNING): (.*?)(?=\n^\[|\z)/ms';
            
            preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);
            $matches = array_reverse($matches);

            $total = count($matches);
            $offset = ($page - 1) * $perPage;
            $paginatedMatches = array_slice($matches, $offset, $perPage);

            foreach ($paginatedMatches as $match) {
                $rawMessage = trim($match[4]);
                $level = $match[3];
                
                $url = null;
                $user = null;
                $role = null;
                $source = 'BACKEND';
                $message = $rawMessage;
                $stack = null;

                if (str_starts_with($rawMessage, 'FRONTEND [')) {
                    $source = 'FRONTEND';
                    if (preg_match('/FRONTEND \[(.*?)\] \| URL: (.*?) \| Error: (.*?)(?: \| Stack: (.*))?$/s', $rawMessage, $frontMatch)) {
                        $userInfoStr = $frontMatch[1];
                        $url = trim($frontMatch[2]);
                        
                        if (preg_match('/Usuario: (.*?) \(Rol: (.*?), ID: (.*?)\)/', $userInfoStr, $uMatch)) {
                            $user = $uMatch[1];
                            $role = $uMatch[2];
                        } else {
                            $user = $userInfoStr;
                        }

                        $message = trim($frontMatch[3]);
                        $stack = isset($frontMatch[4]) ? trim($frontMatch[4]) : null;
                    }
                } else {
                    // Intentar extraer stack trace parcial en backend
                    if (preg_match('/^(.*?)\nStack trace:\n(.*?)$/s', $rawMessage, $stackMatch)) {
                        $message = trim($stackMatch[1]);
                        // Coger solo las primeras 3 líneas del stack trace
                        $stackLines = explode("\n", $stackMatch[2]);
                        $stack = implode("\n", array_slice($stackLines, 0, 3));
                    }

                    if (preg_match('/(\{.*?"user_role":.*?"url":.*?\})\s*$/s', $message, $ctxMatch)) {
                        $ctx = json_decode($ctxMatch[1], true);
                        if ($ctx) {
                            $user = $ctx['user_name'] ?? 'Anónimo';
                            $role = $ctx['user_role'] ?? 'invitado';
                            $url = $ctx['url'] ?? null;
                            $message = trim(str_replace($ctxMatch[1], '', $message));
                        }
                    }
                }

                $logs[] = [
                    'date' => $match[1],
                    'environment' => $match[2],
                    'level' => $level,
                    'source' => $source,
                    'user' => $user,
                    'role' => $role,
                    'url' => $url,
                    'message' => $message,
                    'stack' => $stack
                ];
            }
        }

        return response()->json([
            'success' => true,
            'logs' => $logs,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => max(1, ceil($total / $perPage))
            ]
        ]);
    }

    /**
     * Lee los últimos bytes de un archivo para no saturar memoria
     */
    private function readLastEntries($path, $bytes)
    {
        $size = filesize($path);
        if ($size <= $bytes) return File::get($path);

        $fp = fopen($path, 'r');
        fseek($fp, -$bytes, SEEK_END);
        $data = fread($fp, $bytes);
        fclose($fp);

        // Asegurarnos de no romper el primer bloque incompleto
        $firstBracket = strpos($data, '[');
        return $firstBracket !== false ? substr($data, $firstBracket) : $data;
    }

    /**
     * Limpia el archivo de logs
     */
    public function clear()
    {
        $logChannel = config('logging.default');
        if ($logChannel === 'daily') {
            $logFile = storage_path('logs/laravel-' . date('Y-m-d') . '.log');
        } else {
            $logFile = storage_path('logs/laravel.log');
        }
        
        if (File::exists($logFile)) {
            File::put($logFile, ''); 
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
        $user = auth('web')->user() ?? auth('staff')->user();
        $userInfo = $user ? "Usuario: {$user->name} (Rol: {$user->role}, ID: {$user->id})" : "Visitante Anónimo";
        
        $errorMsg = $request->input('message', 'Error desconocido en frontend');
        $stack = $request->input('stack', '');
        $url = $request->input('url', url()->current());
        $level = strtoupper($request->input('level', 'ERROR')); 
        
        $logText = "FRONTEND [{$userInfo}] | URL: {$url} | Error: {$errorMsg} | Stack: " . substr($stack, 0, 500);

        if ($level === 'CRITICAL') {
            \Illuminate\Support\Facades\Log::critical($logText);
            $this->notifyCriticalError($logText);
        } else if ($level === 'WARNING') {
            \Illuminate\Support\Facades\Log::warning($logText);
        } else {
            \Illuminate\Support\Facades\Log::error($logText);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Envía una notificación si hay un error crítico
     */
    private function notifyCriticalError($message)
    {
        $webhookUrl = config('services.logging.webhook_url');
        if (!$webhookUrl) return;

        try {
            \Illuminate\Support\Facades\Http::post($webhookUrl, [
                'content' => "🚨 **CRITICAL ERROR DETECTED**\n" . $message
            ]);
        } catch (\Exception $e) {
            // No queremos que falle el log por un fallo en el webhook
        }
    }
}
