<?php

namespace App\Services;

use App\Models\Pago;
use App\Models\Clase;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class BookingSwapService
{
    /**
     * Obtiene las sesiones candidatas para un intercambio de clase.
     *
     * @param Pago $pago Pago/reserva original
     * @param int $userId ID del usuario autenticado
     * @return array Estructura con la sesión original y candidatos
     */
    public function getCandidates(Pago $pago, int $userId): array
    {
        // 1. Encontrar la Clase base para obtener el nivel
        $claseBase = Clase::where('nombre', $pago->nombre_clase)
            ->whereHas('centro', function($q) use ($pago) {
                $q->where('nombre', $pago->centro);
            })->first();

        // Fallback 1: Búsqueda flexible por nombre
        if (!$claseBase) {
            $claseBase = Clase::where('nombre', $pago->nombre_clase)->first();
        }

        // Fallback 2: Trim y minúsculas
        if (!$claseBase) {
            $claseBase = Clase::whereRaw('LOWER(TRIM(nombre)) = ?', [strtolower(trim($pago->nombre_clase))])->first();
        }

        $nivelBase = $claseBase ? $claseBase->nivel : null;

        // 2. Obtener los tipos de crédito permitidos para la clase original
        $allowedCreditTypeIds = $pago->tiposCredito->pluck('id')->toArray();

        // 3. Buscar sesiones futuras similares
        $now = now();
        $query = Pago::with(['user', 'entrenadores', 'tiposCredito'])
            ->where('fecha_registro', '>', $now)
            ->where('centro', $pago->centro)
            ->where('tipo_clase', $pago->tipo_clase); // Misma familia de clase
            
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
            
            if ($capacidad > 0 && $count >= $capacidad) {
                continue; // Llena
            }

            // Verificar si el usuario ya está apuntado
            $alreadyBooked = $pagos->contains('user_id', $userId);
            if ($alreadyBooked) continue;

            // Recopilar datos para el frontend
            $entrenadores = [];
            foreach ($pagos as $p) {
                if ($p->entrenadores) {
                    foreach ($p->entrenadores as $t) {
                        $entrenadores[$t->id] = [
                            'id' => $t->id,
                            'name' => $t->name,
                            'foto' => $t->foto_de_perfil ? Storage::url($t->foto_de_perfil) : null
                        ];
                    }
                }
            }

            $alumnos = $pagos->filter(fn($p) => $p->user_id !== null)->map(function ($p) {
                return [
                    'id' => $p->user_id,
                    'nombre' => $p->user->name ?? 'Usuario',
                    'foto' => ($p->user && $p->user->foto_de_perfil) ? Storage::url($p->user->foto_de_perfil) : null
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

        return [
            'original_session' => $pago,
            'candidates' => $candidates
        ];
    }

    /**
     * Ejecuta el intercambio de clase.
     *
     * @param int $originalPagoId ID del pago original
     * @param array $newSessionData Datos de la nueva sesión de destino
     * @param int $userId ID del usuario autenticado
     * @return bool True si la operación se completa con éxito
     * @throws Exception Si ocurre algún error de validación o base de datos
     */
    public function executeSwap(int $originalPagoId, array $newSessionData, int $userId): bool
    {
        $pagoOriginal = Pago::findOrFail($originalPagoId);

        // Seguridad
        if ($pagoOriginal->user_id !== $userId) {
            throw new Exception('No autorizado', 403);
        }

        // 1. Validar ventana de cancelación
        $horasCancelacion = $pagoOriginal->horas_cancelacion ?? 0;
        $diffHours = now()->diffInHours($pagoOriginal->fecha_registro, false);

        if ($diffHours < $horasCancelacion) {
            throw new Exception("No puedes cambiar esta clase. El plazo de modificación (faltan {$diffHours}h) es menor al requerido ({$horasCancelacion}h).", 422);
        }

        // 2. Validar disponibilidad de la nueva sesión
        $fecha = Carbon::parse($newSessionData['fecha_hora']);
        
        $pagosNuevaSesion = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $newSessionData['nombre_clase'])
            ->where('centro', $newSessionData['centro'])
            ->get();

        if ($pagosNuevaSesion->isEmpty()) {
            throw new Exception('La sesión de destino ya no existe.', 404);
        }

        $first = $pagosNuevaSesion->first();
        $count = $pagosNuevaSesion->filter(fn($p) => $p->user_id !== null)->count();
        $capacidad = $first->capacidad_maxima;

        if ($capacidad > 0 && $count >= $capacidad) {
            throw new Exception('La sesión de destino está llena.', 422);
        }

        // 3. Ejecutar intercambio atómico
        try {
            DB::beginTransaction();

            // Buscamos un hueco vacío (user_id = null) en la nueva sesión
            $emptySlot = $pagosNuevaSesion->where('user_id', null)->first();

            if ($emptySlot) {
                // Si hay un hueco vacío, lo ocupamos
                $emptySlot->update([
                    'user_id' => $userId,
                    'metodo_pago' => $pagoOriginal->metodo_pago,
                    'importe' => $pagoOriginal->importe,
                    'horas_cancelacion' => $first->horas_cancelacion,
                ]);
                
                // Traspasamos la relación de créditos
                $tipoCreditoIds = $pagoOriginal->tiposCredito->pluck('id')->toArray();
                $emptySlot->tiposCredito()->sync($tipoCreditoIds);

                // Liberamos el hueco antiguo
                $pagoOriginal->delete();

            } else {
                // Si no hay hueco vacío pero hay capacidad, clonamos el registro base
                $newPago = $first->replicate();
                $newPago->user_id = $userId;
                $newPago->metodo_pago = $pagoOriginal->metodo_pago;
                $newPago->importe = $pagoOriginal->importe;
                $newPago->save();

                $tipoCreditoIds = $pagoOriginal->tiposCredito->pluck('id')->toArray();
                $newPago->tiposCredito()->sync($tipoCreditoIds);

                $pagoOriginal->delete();
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Error al procesar el intercambio: ' . $e->getMessage(), 500);
        }
    }
}
