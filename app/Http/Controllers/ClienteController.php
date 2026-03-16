<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClienteController extends Controller
{
    /**
     * Dashboard del cliente: ver créditos y clases de la semana.
     */
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();

        // Créditos totales
        $totalCreditos = $user->suscripciones()
            ->where('estado', 'activo')
            ->sum('saldo_actual');

        // Clases de esta semana (a partir de hoy)
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $clases = HorarioClase::with(['clase', 'entrenador', 'centro'])
            ->whereBetween('fecha_hora_inicio', [$startOfWeek, $endOfWeek])
            ->where('fecha_hora_inicio', '>=', now())
            ->orderBy('fecha_hora_inicio')
            ->get();

        // Obtener IDs de clases ya reservadas por el usuario
        $misReservasIds = Reserva::where('id_usuario', $user->id)
            ->whereIn('id_horario_clase', $clases->pluck('id'))
            ->pluck('id_horario_clase')
            ->toArray();

        // Para cada clase, verificar si el usuario tiene créditos (atendiendo a la jerarquía)
        foreach ($clases as $clase) {
            $clase->ya_reservada = in_array($clase->id, $misReservasIds);
            $clase->tiene_credito = $user->tieneCreditosPara($clase->clase->nombre);

            // Contar ocupación actual
            $clase->ocupacion = Reserva::where('id_horario_clase', $clase->id)
                ->where('estado', 'confirmada')
                ->count();
        }

        // Agrupar por día
        $clasesAgrupadas = $clases->groupBy(function ($date) {
            return $date->fecha_hora_inicio->format('Y-m-d');
        });

        return view('cliente.dashboard', compact('user', 'totalCreditos', 'clasesAgrupadas'));
    }

    /**
     * Procesar la reserva de una clase.
     */
    public function reservar(Request $request)
    {
        $request->validate([
            'horario_id' => 'required|exists:horarios_clases,id'
        ]);

        /** @var User $user */
        $user = Auth::user();
        $horario = HorarioClase::with('clase')->findOrFail($request->horario_id);

        // 1. Verificar si ya está reservada
        if (Reserva::where('id_usuario', $user->id)->where('id_horario_clase', $horario->id)->exists()) {
            return back()->with('error', 'Ya tienes una reserva para esta clase.');
        }

        // 2. Verificar capacidad
        $ocupacion = Reserva::where('id_horario_clase', $horario->id)->where('estado', 'confirmada')->count();
        if ($ocupacion >= $horario->capacidad) {
            return back()->with('error', 'Lo sentimos, esta clase ya está completa.');
        }

        // 3. Ejecutar reserva en transacción
        try {
            DB::beginTransaction();

            // Descontar crédito
            $descontado = $user->descontarCredito($horario->clase->nombre);

            if (!$descontado) {
                DB::rollBack();
                return back()->with('error', 'No tienes créditos suficientes para este tipo de clase.');
            }

            // Crear reserva
            Reserva::create([
                'id_usuario' => $user->id,
                'id_horario_clase' => $horario->id,
                'estado' => 'confirmada'
            ]);

            DB::commit();
            return back()->with('success', '¡Reserva realizada con éxito!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Ocurrió un error al procesar la reserva. Inténtalo de nuevo.');
        }
    }

    /**
     * API para que FullCalendar obtenga las clases.
     */
    public function apiClases()
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->addWeeks(4)->endOfWeek(); // Próximas 4 semanas

        $clases = HorarioClase::with(['clase', 'entrenador'])
            ->whereBetween('fecha_hora_inicio', [$startOfWeek, $endOfWeek])
            ->get();

        $events = $clases->map(function ($h) {
            $color = '#4BB7AE'; // Teal por defecto
            if (str_contains($h->clase->nombre, 'EP'))
                $color = '#EF5D7A'; // Coral para EP
            if (str_contains($h->clase->nombre, 'Dúo'))
                $color = '#A5EFE2';

            return [
                'id' => $h->id,
                'title' => $h->clase->nombre . ' (' . $h->entrenador->nombre . ')',
                'start' => $h->fecha_hora_inicio->toIso8601String(),
                'end' => $h->fecha_hora_inicio->addMinutes($h->clase->duracion_minutos)->toIso8601String(),
                'backgroundColor' => $color,
                'borderColor' => $color,
                'extendedProps' => [
                    'entrenador' => $h->entrenador->nombre,
                    'clase' => $h->clase->nombre,
                    'isFull' => (Reserva::where('id_horario_clase', $h->id)->where('estado', 'confirmada')->count() >= $h->capacidad)
                ]
            ];
        });

        return response()->json($events);
    }
}
