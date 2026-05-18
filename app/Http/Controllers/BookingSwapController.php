<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Clase;
use App\Models\TipoSesion;
use App\Models\CreditoLote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BookingSwapController extends Controller
{
    /**
     * Obtiene clases candidatas para un intercambio.
     */
    public function getCandidates(Request $request, Pago $pago)
    {
        // Seguridad: el pago debe pertenecer al usuario
        if ($pago->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // 1. Encontrar la Clase base para obtener el nivel
        $claseBase = Clase::where('nombre', $pago->nombre_clase)
            ->whereHas('centro', function($q) use ($pago) {
                $q->where('nombre', $pago->centro);
            })->first();

        // Fallback 1: Si no se encuentra por centro (por inconsistencia de datos), buscar solo por nombre
        if (!$claseBase) {
            $claseBase = Clase::where('nombre', $pago->nombre_clase)->first();
        }

        // Fallback 2: Búsqueda flexible (trim y minúsculas) por si hay espacios o diferencias de caja
        if (!$claseBase) {
            $claseBase = Clase::whereRaw('LOWER(TRIM(nombre)) = ?', [strtolower(trim($pago->nombre_clase))])->first();
        }

        // Si no se encuentra la clase base, no abortamos con 404.
        // Simplemente no podremos filtrar por nivel, pero permitiremos buscar por tipo de clase.
        $nivelBase = $claseBase ? $claseBase->nivel : null;

        // 2. Obtener los tipos de crédito permitidos para la clase original
        $allowedCreditTypeIds = $pago->tiposCredito->pluck('id')->toArray();

        // 3. Buscar sesiones futuras similares
        // Una sesión similar:
        // - Misma Nivel
        // - Mismos Tipos de Crédito permitidos (o al menos uno coincidente)
        // - En el mismo centro (para cumplir con "igual todo")
        // - Fecha futura
        // - Con capacidad disponible
        
        $now = now();
        
        // Obtenemos todos los pagos futuros para agruparlos como sesiones
        $query = Pago::with(['user', 'entrenadores', 'tiposCredito'])
            ->where('fecha_registro', '>', $now)
            ->where('centro', $pago->centro)
            ->where('tipo_clase', $pago->tipo_clase); // Misma familia de clase
            
        // Eliminamos el filtro de != nombre_clase para permitir swaps a la misma actividad en otro horario
        if (!empty($allowedCreditTypeIds)) {
            $query->whereHas('tiposCredito', function($q) use ($allowedCreditTypeIds) {
                $q->whereIn('tipo_credito_id', $allowedCreditTypeIds);
            });
        } else {
            $query->doesntHave('tiposCredito');
        }

        $futurePagos = $query->get();

        // Agrupamos por sesión (fecha, nombre, centro)
        $grouped = $futurePagos->groupBy(function($p) {
            return $p->fecha_registro->format('Y-m-d H:i:s') . '|' . $p->nombre_clase . '|' . $p->centro;
        });

        $candidates = [];

        foreach ($grouped as $key => $pagos) {
            $first = $pagos->first();

            // 1. Omitir la sesión actual (misma fecha, nombre y centro)
            if ($first->fecha_registro->eq($pago->fecha_registro) && 
                $first->nombre_clase === $pago->nombre_clase && 
                $first->centro === $pago->centro) {
                continue;
            }

            $capacidad = $first->capacidad_maxima ?? 0;
            
            // Verificar nivel de la clase candidata
            $claseCand = Clase::where('nombre', $first->nombre_clase)
                ->whereHas('centro', function($q) use ($first) {
                    $q->where('nombre', $first->centro);
                })->first();

            if (!$claseCand) {
                $claseCand = Clase::where('nombre', $first->nombre_clase)->first();
            }

            if ($nivelBase && $claseCand && $claseCand->nivel !== $nivelBase) {
                continue;
            }

            // Verificar capacidad
            $count = $pagos->filter(fn($p) => $p->user_id !== null)->count();
            $capacidad = $first->capacidad_maxima ?? 0;
            
            if ($capacidad > 0 && $count >= $capacidad) {
                continue; // Llena
            }

            // Verificar si el usuario ya está apuntado
            $alreadyBooked = $pagos->contains('user_id', Auth::id());
            if ($alreadyBooked) continue;

            // Recopilar datos para el frontend
            $entrenadores = [];
            foreach ($pagos as $p) {
                if ($p->entrenadores) {
                    foreach ($p->entrenadores as $t) {
                        $entrenadores[$t->id] = [
                            'id' => $t->id,
                            'name' => $t->name,
                            'foto' => $t->foto_de_perfil ? \Storage::url($t->foto_de_perfil) : null
                        ];
                    }
                }
            }

            $alumnos = $pagos->filter(fn($p) => $p->user_id !== null)->map(function ($p) {
                return [
                    'id' => $p->user_id,
                    'nombre' => $p->user->name ?? 'Usuario',
                    'foto' => ($p->user && $p->user->foto_de_perfil) ? \Storage::url($p->user->foto_de_perfil) : null
                ];
            })->values();

            $candidates[] = [
                'session_key' => [
                    'fecha_hora' => $first->fecha_registro->format('Y-m-d H:i:s'),
                    'nombre_clase' => $first->nombre_clase,
                    'centro' => $first->centro
                ],
                'nombre_clase' => $first->nombre_clase,
                'fecha_registro' => $first->fecha_registro->toDateTimeString(),
                'tipo_clase' => $first->tipo_clase,
                'centro' => $first->centro,
                'capacidad_maxima' => $capacidad,
                'alumnos_count' => $count,
                'entrenadores' => array_values($entrenadores),
                'alumnos' => $alumnos,
                'nivel' => $claseCand ? $claseCand->nivel : null,
            ];
        }

        return response()->json([
            'original_session' => $pago,
            'candidates' => $candidates
        ]);
    }

    /**
     * Ejecuta el intercambio de clase.
     */
    public function executeSwap(Request $request)
    {
        $request->validate([
            'original_pago_id' => 'required|exists:pagos,id',
            'new_session' => 'required|array',
            'new_session.fecha_hora' => 'required|date',
            'new_session.nombre_clase' => 'required|string',
            'new_session.centro' => 'required|string',
        ]);

        $pagoOriginal = Pago::findOrFail($request->original_pago_id);

        // Seguridad
        if ($pagoOriginal->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // 1. Validar ventana de cancelación
        $horasCancelacion = $pagoOriginal->horas_cancelacion ?? 0;
        $diffHours = now()->diffInHours($pagoOriginal->fecha_registro, false);

        if ($diffHours < $horasCancelacion) {
            return response()->json(['error' => "No puedes cambiar esta clase. El plazo de modificación (faltan {$diffHours}h) es menor al requerido ({$horasCancelacion}h)."], 422);
        }

        // 2. Validar disponibilidad de la nueva sesión
        $newSession = $request->new_session;
        $fecha = Carbon::parse($newSession['fecha_hora']);
        
        $pagosNuevaSesion = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $newSession['nombre_clase'])
            ->where('centro', $newSession['centro'])
            ->get();

        if ($pagosNuevaSesion->isEmpty()) {
            return response()->json(['error' => 'La sesión de destino ya no existe.'], 404);
        }

        $first = $pagosNuevaSesion->first();
        $count = $pagosNuevaSesion->filter(fn($p) => $p->user_id !== null)->count();
        $capacidad = $first->capacidad_maxima;

        if ($capacidad > 0 && $count >= $capacidad) {
            return response()->json(['error' => 'La sesión de destino está llena.'], 422);
        }

        // 3. Ejecutar intercambio atómico
        try {
            DB::beginTransaction();

            // Buscamos un hueco vacío (user_id = null) en la nueva sesión
            $emptySlot = $pagosNuevaSesion->where('user_id', null)->first();

            if ($emptySlot) {
                // Si hay un hueco vacío, lo ocupamos
                $emptySlot->update([
                    'user_id' => Auth::id(),
                    'metodo_pago' => $pagoOriginal->metodo_pago,
                    'importe' => $pagoOriginal->importe,
                    'horas_cancelacion' => $first->horas_cancelacion, // Opcional: mantener el de la nueva clase
                ]);
                
                // Traspasamos la relación de créditos
                $tipoCreditoIds = $pagoOriginal->tiposCredito->pluck('id')->toArray();
                $emptySlot->tiposCredito()->sync($tipoCreditoIds);

                // Liberamos el hueco antiguo (eliminamos la reserva del usuario)
                // En este sistema, si borramos el pago del usuario, el "hueco" queda libre si hay otros registros
                // o si es el último, se suele quedar uno con user_id null.
                // Según la lógica de removeClientFromSession, simplemente se borra el registro.
                $pagoOriginal->delete();

            } else {
                // Si no hay hueco vacío pero hay capacidad (esto no debería pasar si count < capacidad, 
                // pero por si acaso), clonamos un registro base de la sesión.
                $newPago = $first->replicate();
                $newPago->user_id = Auth::id();
                $newPago->metodo_pago = $pagoOriginal->metodo_pago;
                $newPago->importe = $pagoOriginal->importe;
                $newPago->save();

                $tipoCreditoIds = $pagoOriginal->tiposCredito->pluck('id')->toArray();
                $newPago->tiposCredito()->sync($tipoCreditoIds);

                $pagoOriginal->delete();
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Clase intercambiada correctamente.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al procesar el intercambio: ' . $e->getMessage()], 500);
        }
    }
}
