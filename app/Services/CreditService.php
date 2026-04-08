<?php

namespace App\Services;

use App\Models\SuscripcionUsuario;
use App\Models\CreditoLote;
use Carbon\Carbon;

class CreditService
{
    /**
     * Entrega un lote de créditos a un usuario.
     */
    public function allocate(SuscripcionUsuario $subUser, float $amount, int $pagoId = null)
    {
        $vencimiento = $this->calculateNextExpiry($subUser);

        return CreditoLote::create([
            'suscripcion_usuario_id' => $subUser->id,
            'cantidad_inicial' => $amount,
            'cantidad_actual' => $amount,
            'fecha_vencimiento' => $vencimiento,
            'pago_id' => $pagoId
        ]);
    }

    /**
     * Consume créditos de los lotes disponibles (el que antes caduca primero).
     */
    public function consume(SuscripcionUsuario $subUser, float $amount = 1)
    {
        $lotes = $subUser->lotes()->validos()->orderBy('fecha_vencimiento', 'asc')->get();
        $restante = $amount;

        foreach ($lotes as $lote) {
            if ($restante <= 0) break;

            if ($lote->cantidad_actual >= $restante) {
                $lote->decrement('cantidad_actual', $restante);
                $restante = 0;
            } else {
                $restante -= $lote->cantidad_actual;
                $lote->update(['cantidad_actual' => 0]);
            }
        }

        return $restante <= 0;
    }

    /**
     * Calcula la fecha de vencimiento del próximo lote basado en el día de recarga.
     */
    private function calculateNextExpiry(SuscripcionUsuario $subUser)
    {
        $suscripcion = $subUser->suscripcion;
        $periodo = $suscripcion->periodo; // 'semanal' o 'mensual'
        $diaRecarga = $subUser->dia_recarga;
        $mesesReset = $suscripcion->meses_reset;

        // Caso especial: 1 Mes desde que se entregan (ignora día de recarga fijo)
        if ($mesesReset == 15) {
            return now()->addMonth()->startOfDay();
        }

        if (!$diaRecarga) {
            // Si no hay día definido, caduca en 1 semana/mes desde hoy por defecto
            return $periodo === 'semanal' ? now()->addWeek()->startOfDay() : now()->addMonth()->startOfDay();
        }

        $now = now();
        
        if (strtolower($periodo) === 'semanal') {
            // diaRecarga 1-7 (Lunes-Domingo)
            $vencimiento = $now->copy()->next($this->getDayName($diaRecarga));
            // Si hoy es el día de recarga, el vencimiento es la próxima semana
            if ($now->dayOfWeek === ($diaRecarga % 7)) {
                $vencimiento = $now->copy()->addWeek();
            }
        } else {
            // Mensual: diaRecarga 1-31
            $vencimiento = $now->copy()->day($diaRecarga);
            if ($now->day >= $diaRecarga) {
                $vencimiento->addMonth();
            }
        }

        return $vencimiento->startOfDay();
    }

    private function getDayName($dayNumber)
    {
        $days = [
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            7 => 'Sunday'
        ];
        return $days[$dayNumber] ?? 'Monday';
    }
}
