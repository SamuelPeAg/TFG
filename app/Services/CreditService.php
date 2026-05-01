<?php

namespace App\Services;

use App\Models\SuscripcionUsuario;
use App\Models\CreditoLote;
use Carbon\Carbon;

class CreditService
{
    /**
     * Entrega los créditos completos de una suscripción.
     */
    public function allocateSubscription(SuscripcionUsuario $subUser, int $pagoId = null)
    {
        $lotes = [];
        foreach ($subUser->suscripcion->creditos as $credito) {
            $lotes[] = $this->allocate(
                $subUser, 
                $credito->tipo_credito_id, 
                $credito->cantidad, 
                $credito->dias_caducidad, 
                $pagoId
            );
        }
        return $lotes;
    }

    /**
     * Entrega un lote específico de créditos a un usuario.
     */
    public function allocate(SuscripcionUsuario $subUser, int $tipoCreditoId, float $amount, int $diasCaducidad = null, int $pagoId = null)
    {
        $vencimiento = $this->calculateNextExpiry($subUser, $diasCaducidad);

        return CreditoLote::create([
            'suscripcion_usuario_id' => $subUser->id,
            'tipo_credito_id' => $tipoCreditoId,
            'cantidad_inicial' => $amount,
            'cantidad_actual' => $amount,
            'fecha_vencimiento' => $vencimiento,
            'pago_id' => $pagoId
        ]);
    }

    /**
     * Consume créditos de los lotes disponibles (el que antes caduca primero).
     */
    public function consume(SuscripcionUsuario $subUser, int $tipoSesionId, float $amount = 1)
    {
        $lotes = $subUser->lotes()
            ->validos()
            ->whereHas('tipoCredito.sesiones', function($q) use ($tipoSesionId) {
                $q->where('tipos_sesion.id', $tipoSesionId);
            })
            ->orderBy('fecha_vencimiento', 'asc')
            ->get();
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
     * Consume créditos directamente de un lote específico por su tipo_credito_id (ajuste manual).
     */
    public function consumeByCredito(SuscripcionUsuario $subUser, int $tipoCreditoId, float $amount = 1)
    {
        $lotes = $subUser->lotes()
            ->validos()
            ->where('tipo_credito_id', $tipoCreditoId)
            ->orderBy('fecha_vencimiento', 'asc')
            ->get();
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
     * Devuelve créditos a los lotes disponibles (el que más tarde caduca primero, o cualquiera válido).
     */
    public function refund(SuscripcionUsuario $subUser, int $tipoSesionId, float $amount = 1)
    {
        // Buscamos el lote que aún no haya caducado para devolverle el crédito
        // No usamos 'validos()' porque ese scope filtra por cantidad_actual > 0
        $lote = $subUser->lotes()
            ->where('fecha_vencimiento', '>=', now())
            ->whereHas('tipoCredito.sesiones', function($q) use ($tipoSesionId) {
                $q->where('tipos_sesion.id', $tipoSesionId);
            })
            ->orderBy('fecha_vencimiento', 'desc')
            ->first();

        if ($lote) {
            $lote->increment('cantidad_actual', $amount);
            return true;
        }

        return false;
    }

    /**
     * Calcula la fecha de vencimiento del próximo lote basado en el día de recarga.
     */
    private function calculateNextExpiry(SuscripcionUsuario $subUser, int $diasCaducidad = null)
    {
        $suscripcion = $subUser->suscripcion;

        if ($diasCaducidad !== null && $diasCaducidad > 0) {
            return now()->addDays($diasCaducidad)->startOfDay();
        } elseif ($diasCaducidad === 0) {
            // Never expires, set it far in the future
            return now()->addYears(100)->startOfDay();
        }

        $periodo = $suscripcion->periodo; // 'semanal' o 'mensual'
        $diaRecarga = $subUser->dia_recarga;

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
