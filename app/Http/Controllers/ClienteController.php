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
    public function apiClases(Request $request)
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->addWeeks(4)->endOfWeek();

        /** @var User $user */
        $user = Auth::guard('web')->user() ?? Auth::guard('entrenador')->user();

        $query = HorarioClase::with(['clase', 'entrenador', 'reservas.usuario'])
            ->whereBetween('fecha_hora_inicio', [$startOfWeek, $endOfWeek]);

        // Filtrado por tipo de clase (si se especifica en el frontend)
        if ($request->has('tipo') && $request->tipo != 'all') {
            $query->whereHas('clase', function($q) use ($request) {
                $q->where('nombre', 'LIKE', '%' . $request->tipo . '%');
            });
        }

        $clases = $query->get();

        // Si el usuario quiere ver solo las compatibles con sus créditos
        if ($request->boolean('compatible_only') && $user && method_exists($user, 'tieneCreditosPara')) {
            $clases = $clases->filter(function ($h) use ($user) {
                return $user->tieneCreditosPara($h->clase->nombre);
            });
        }

        $events = $clases->map(function ($h) {
            $color = '#4BB7AE'; // Teal (General)
            $nombreLower = strtolower($h->clase->nombre);
            if (str_contains($nombreLower, 'ep') || str_contains($nombreLower, 'personal'))
                $color = '#EF5D7A'; // Coral
            elseif (str_contains($nombreLower, 'duo') || str_contains($nombreLower, 'dúo'))
                $color = '#F6AD55'; // Orange
            elseif (str_contains($nombreLower, 'trio') || str_contains($nombreLower, 'trío'))
                $color = '#4FD1C5'; // Aqua
            elseif (str_contains($nombreLower, 'privado'))
                $color = '#9F7AEA'; // Purple

            // Datos de los clientes inscritos
            $clientesInscritos = $h->reservas->where('estado', 'confirmada')->map(function ($res) {
                return [
                    'nombre' => $res->usuario->name ?? $res->usuario->nombre,
                    'foto' => $res->usuario->foto_de_perfil ? asset('storage/' . $res->usuario->foto_de_perfil) : null,
                ];
            })->values();

            return [
                'id' => $h->id,
                'title' => $h->clase->nombre,
                'start' => $h->fecha_hora_inicio->toIso8601String(),
                'end' => $h->fecha_hora_inicio->addMinutes($h->clase->duracion_minutos)->toIso8601String(),
                'backgroundColor' => $color,
                'borderColor' => $color,
                'extendedProps' => [
                    'entrenador' => $h->entrenador->nombre,
                    'entrenador_foto' => $h->entrenador->foto_de_perfil ? asset('storage/' . $h->entrenador->foto_de_perfil) : null,
                    'clase' => $h->clase->nombre,
                    'ocupacion' => $clientesInscritos->count(),
                    'capacidad' => $h->capacidad,
                    'isFull' => $clientesInscritos->count() >= $h->capacidad,
                    'clientes' => $clientesInscritos,
                ]
            ];
        });

        return response()->json($events->values());
    }
}
