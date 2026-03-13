<?php

namespace App\Http\Controllers;

use App\Models\SuscripcionUsuario;
use App\Models\Suscripcion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuscripcionUsuarioController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_usuario' => 'required|exists:users,id',
            'id_suscripcion' => 'required|exists:suscripciones,id',
            'saldo_actual' => 'nullable|integer|min:0',
        ]);

        $suscripcion = Suscripcion::find($validated['id_suscripcion']);
        
        // Si no se especifica saldo, empezamos con los créditos por periodo
        $saldo = $validated['saldo_actual'] ?? $suscripcion->creditos_por_periodo;

        SuscripcionUsuario::updateOrCreate(
            [
                'id_usuario' => $validated['id_usuario'],
                'id_suscripcion' => $validated['id_suscripcion'],
            ],
            [
                'id_entrenador' => Auth::id(),
                'saldo_actual' => $saldo,
                'ultima_recarga' => now(),
                'estado' => 'activo',
            ]
        );

        return back()->with('success', 'Suscripción asignada correctamente');
    }

    public function update(Request $request, $id)
    {
        $susuario = SuscripcionUsuario::findOrFail($id);
        
        $validated = $request->validate([
            'saldo_actual' => 'required|integer|min:0',
            'estado' => 'required|in:activo,cancelado',
        ]);

        $susuario->update($validated);

        return back()->with('success', 'Suscripción de usuario actualizada');
    }

    public function destroy($id)
    {
        $susuario = SuscripcionUsuario::findOrFail($id);
        $susuario->delete();
        return back()->with('success', 'Suscripción de usuario eliminada');
    }

    /**
     * Ajusta el saldo de una suscripción de usuario (incrementar o decrementar).
     */
    public function ajustarSaldo(Request $request, $id)
    {
        $susuario = SuscripcionUsuario::findOrFail($id);
        $accion = $request->input('accion'); // 'inc' o 'dec'
        $cantidad = $request->input('cantidad', 1);

        if ($accion === 'inc') {
            $susuario->increment('saldo_actual', $cantidad);
        } elseif ($accion === 'dec' && $susuario->saldo_actual > 0) {
            $susuario->decrement('saldo_actual', $cantidad);
        }

        $susuario->refresh();

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'nuevo_saldo' => $susuario->saldo_actual
            ]);
        }

        return back()->with('success', 'Saldo actualizado correctamente');
    }
}
