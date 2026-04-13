<?php

namespace App\Http\Controllers;

use App\Models\SuscripcionUsuario;
use App\Models\Suscripcion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Models\Pago;
use App\Services\CreditService;

class SuscripcionUsuarioController extends Controller
{
    protected $creditService;

    public function __construct(CreditService $creditService)
    {
        $this->creditService = $creditService;
    }
    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasAnyRole(['admin', 'entrenador'])) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para modificar créditos.'], 403);
        }

        $validated = $request->validate([
            'id_usuario'    => 'required|exists:users,id',
            'id_suscripcion' => 'required|exists:suscripciones,id',
            'saldo_actual'  => 'nullable|integer|min:0',
        ]);

        $suscripcion = Suscripcion::findOrFail($validated['id_suscripcion']);

        // Al asignar la suscripción, el cliente recibe de inmediato los créditos
        // del primer ciclo (creditos_por_periodo). Si el admin especifica un
        // saldo_actual manual (ej: migración), se usa ese en su lugar.
        $saldo = $validated['saldo_actual'] ?? $suscripcion->creditos_por_periodo;

        $susuario = SuscripcionUsuario::create([
            'id_usuario'    => $validated['id_usuario'],
            'id_suscripcion' => $validated['id_suscripcion'],
            'id_entrenador' => Auth::id(),
            'saldo_actual'  => $saldo, // Mantenemos legacy por ahora para compatibilidad UI simple
            'ultima_recarga' => now(),
            'estado'        => 'activo',
            'dia_recarga'   => $request->input('dia_recarga'),
            'fecha_vencimiento_suscripcion' => $request->input('fecha_vencimiento_suscripcion'),
            'pago_adelantado' => $request->boolean('pago_adelantado'),
        ]);

        // Solo liberamos los créditos si el pago ha sido confirmado por adelantado
        if ($saldo > 0 && $request->boolean('pago_adelantado')) {
            $this->creditService->allocate($susuario, $saldo);
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'suscripcion_usuario' => $susuario->load('suscripcion')]);
        }
        return back()->with('success', "Suscripción asignada. Créditos iniciales: {$saldo}.");
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasAnyRole(['admin', 'entrenador'])) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para modificar créditos.'], 403);
        }

        $susuario = SuscripcionUsuario::findOrFail($id);
        
        $validated = $request->validate([
            'saldo_actual' => 'required|integer|min:0',
            'estado' => 'required|in:activo,cancelado',
        ]);

        $susuario->update($validated);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'suscripcion_usuario' => $susuario]);
        }
        return back()->with('success', 'Suscripción de usuario actualizada');
    }

    public function destroy(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasAnyRole(['admin', 'entrenador'])) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para realizar esta acción.'], 403);
        }

        $susuario = SuscripcionUsuario::findOrFail($id);
        $susuario->delete();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true]);
        }
        return back()->with('success', 'Suscripción de usuario eliminada');
    }

    public function ajustarSaldo(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasAnyRole(['admin', 'entrenador'])) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para modificar créditos.'], 403);
        }

        $susuario = SuscripcionUsuario::findOrFail($id);
        $accion = $request->input('accion');
        $cantidad = $request->input('cantidad', 1);

        if ($accion === 'inc') {
            $this->creditService->allocate($susuario, $cantidad);
        } elseif ($accion === 'dec') {
            $this->creditService->consume($susuario, $cantidad);
        }

        $susuario->refresh();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'nuevo_saldo' => $susuario->saldo_actual
            ]);
        }

        return back()->with('success', 'Saldo actualizado correctamente');
    }

    public function confirmarPago(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasAnyRole(['admin', 'entrenador'])) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para confirmar pagos.'], 403);
        }

        $susuario = SuscripcionUsuario::findOrFail($id);
        $suscripcion = $susuario->suscripcion;

        // 1. Crear el registro del pago
        $pago = Pago::create([
            'user_id' => $susuario->id_usuario,
            'entrenador_id' => Auth::id(),
            'centro' => $suscripcion->centro->nombre ?? 'Centro',
            'nombre_clase' => 'Abono: ' . $suscripcion->nombre,
            'tipo_clase' => 'Suscripción',
            'importe' => $suscripcion->precio,
            'metodo_pago' => $request->input('metodo_pago', 'Efectivo'),
            'fecha_registro' => now(),
        ]);

        // 2. Liberar los créditos
        $this->creditService->allocate($susuario, $suscripcion->creditos_por_periodo, $pago->id);

        // 3. Resetear flag de pago adelantado si lo tenía
        $susuario->update([
            'pago_adelantado' => false,
            'ultima_recarga' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pago confirmado y créditos entregados.',
            'nuevo_saldo' => $susuario->saldo_actual_calculado
        ]);
    }
}
