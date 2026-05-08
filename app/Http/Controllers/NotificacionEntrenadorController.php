<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotificacionEntrenador;
use Illuminate\Support\Facades\Auth;

class NotificacionEntrenadorController extends Controller
{
    /**
     * Devuelve todas las notificaciones para el admin.
     */
    public function index()
    {
        $notificaciones = NotificacionEntrenador::with(['entrenador', 'destinatario'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notificaciones);
    }

    /**
     * Devuelve las notificaciones del propio entrenador.
     */
    public function myNotifications()
    {
        $user = Auth::guard('staff')->user();
        if (!$user) return response()->json([], 401);

        // Mensajes que he enviado O que he recibido
        $notificaciones = NotificacionEntrenador::with(['entrenador', 'destinatario'])
            ->where(function($query) use ($user) {
                $query->where('entrenador_id', $user->id)
                      ->orWhere('destinatario_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notificaciones);
    }

    /**
     * Devuelve la lista de entrenadores para seleccionar.
     */
    public function getEntrenadores()
    {
        $user = Auth::guard('staff')->user();
        if (!$user) return response()->json([], 401);

        $entrenadores = \App\Models\Entrenador::with('roles')
            ->where('id', '!=', $user->id)
            ->get();

        $data = $entrenadores->map(function($e) {
            $roleNames = $e->roles->pluck('name')->map(fn($n) => strtoupper($n))->implode(', ');
            return [
                'id' => $e->id,
                'name' => $e->name . ($roleNames ? " ({$roleNames})" : ""),
                'email' => $e->email
            ];
        });

        return response()->json($data);
    }

    /**
     * Los entrenadores mandan una notificación.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚüÜ.,!?¿¡()\'"\-=@:;+]+$/'],
            'mensaje' => ['required', 'string', 'regex:/^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚüÜ.,!?¿¡()\'"\-=@:;+\r\n]+$/'],
            'tipo' => 'nullable|string|in:general,incidencia,clase',
            'destinatario_id' => 'nullable|exists:entrenadores,id'
        ], [
            'titulo.regex' => 'El título contiene caracteres no válidos. Evita usar símbolos extraños o de código (<, >, $, %, etc.).',
            'mensaje.regex' => 'El mensaje contiene caracteres no válidos. Evita usar símbolos extraños o de código (<, >, $, %, etc.).'
        ]);

        $user = Auth::guard('staff')->user();
        if (!$user) return response()->json(['error' => 'No autenticado'], 401);

        $notificacion = NotificacionEntrenador::create([
            'entrenador_id' => $user->id,
            'destinatario_id' => $validated['destinatario_id'] ?? null,
            'titulo' => strip_tags(trim($validated['titulo'])),
            'mensaje' => strip_tags(trim($validated['mensaje'])),
            'tipo' => $validated['tipo'] ?? 'general'
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Notificación enviada correctamente',
            'notificacion' => $notificacion
        ]);
    }

    /**
     * Marca una notificación como leída.
     */
    public function markAsRead($id)
    {
        $notificacion = NotificacionEntrenador::findOrFail($id);
        $notificacion->update(['leido' => true]);
        
        return response()->json(['success' => true]);
    }

    /**
     * El admin responde a una notificación.
     */
    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'respuesta' => ['required', 'string', 'regex:/^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚüÜ.,!?¿¡()\'"\-=@:;+\r\n]+$/']
        ], [
            'respuesta.regex' => 'La respuesta contiene caracteres no válidos. Evita usar símbolos extraños o de código (<, >, $, %, etc.).'
        ]);

        $notificacion = NotificacionEntrenador::findOrFail($id);
        $notificacion->update([
            'respuesta' => strip_tags(trim($validated['respuesta'])),
            'fecha_respuesta' => now(),
            'leido' => true // Marcar como leída automáticamente al responder
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Respuesta enviada correctamente'
        ]);
    }

    /**
     * Elimina una notificación.
     */
    public function destroy($id)
    {
        $notificacion = NotificacionEntrenador::findOrFail($id);
        $notificacion->delete();
        
        return response()->json(['success' => true]);
    }
}
