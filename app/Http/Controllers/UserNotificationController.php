<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserNotificationController extends Controller
{
    /**
     * Alternar una alerta sobre un campo específico del perfil del cliente.
     */
    public function toggleFieldAlert(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'field' => 'required|string',
            'message' => 'nullable|string'
        ]);

        // Verificar permisos (Admin o Coach con permiso)
        $currentUser = Auth::user();
        if (!$currentUser->hasRole('admin') && !$currentUser->can('alertar_clientes')) {
            return response()->json(['message' => 'No tienes permiso para alertar a clientes.'], 403);
        }

        $userId = $request->input('user_id');
        $field = $request->input('field');

        // Buscar si ya existe la alerta activa
        $existing = UserNotification::where('user_id', $userId)
            ->where('type', 'field_alert')
            ->where('field', $field)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'success' => true,
                'action' => 'deleted',
                'message' => 'Alerta eliminada correctamente'
            ]);
        }

        $notif = UserNotification::create([
            'user_id' => $userId,
            'type' => 'field_alert',
            'field' => $field,
            'message' => $request->input('message', "Por favor, actualiza tu campo " . strtoupper($field)),
            'created_by' => $currentUser->id
        ]);

        return response()->json([
            'success' => true,
            'action' => 'created',
            'notification' => $notif,
            'message' => 'Alerta enviada al cliente'
        ]);
    }

    /**
     * Obtener todas las notificaciones/alertas de un usuario.
     */
    public function getUserNotifications($userId = null)
    {
        $id = $userId ?? Auth::id();
        
        $notifications = UserNotification::where('user_id', $id)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    /**
     * Marcar una notificación como leída.
     */
    public function markAsRead($id)
    {
        $notif = UserNotification::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $notif->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}
