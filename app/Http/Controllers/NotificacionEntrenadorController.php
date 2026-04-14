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
        $notificaciones = NotificacionEntrenador::with('entrenador')
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

        $notificaciones = NotificacionEntrenador::where('entrenador_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notificaciones);
    }

    /**
     * Los entrenadores mandan una notificación.
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'mensaje' => 'required|string',
            'tipo' => 'nullable|string'
        ]);

        $user = Auth::guard('staff')->user();
        
        if (!$user || $user->hasRole('admin')) {
             // Si no hay usuario o es admin, no debería usar esta ruta para "notificar" como entrenador
             // aunque un admin técnico podría, el usuario pidió "apartado de notificar en entrenador"
             if (!$user) return response()->json(['error' => 'No autenticado'], 401);
        }

        $notificacion = NotificacionEntrenador::create([
            'entrenador_id' => $user->id,
            'titulo' => $request->titulo,
            'mensaje' => $request->mensaje,
            'tipo' => $request->tipo ?? 'general'
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
        $request->validate([
            'respuesta' => 'required|string'
        ]);

        $notificacion = NotificacionEntrenador::findOrFail($id);
        $notificacion->update([
            'respuesta' => $request->respuesta,
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
