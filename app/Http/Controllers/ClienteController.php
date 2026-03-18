<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\Reserva;
use App\Models\User;
use App\Models\Pago;
use App\Models\Centro;
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

        // Clases de esta semana (a partir de hoy) en la tabla PAGOS
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->addWeeks(1)->endOfWeek();

        // Buscamos todas las sesiones de esta semana
        $allSessionsThisWeek = Pago::with(['user', 'entrenadores', 'entrenador'])
            ->whereBetween('fecha_registro', [$startOfWeek, $endOfWeek])
            ->get();

        // Agrupamos por sesión para dárselo a la vista
        $groupedSessions = $allSessionsThisWeek->groupBy(function ($p) {
            return $p->fecha_registro->format('Y-m-d H:i:s') . '|' . strtolower(trim($p->nombre_clase)) . '|' . $p->centro;
        });

        $clasesProcesadas = [];
        foreach ($groupedSessions as $key => $grupo) {
            $first = $grupo->first();
            $alumnosReales = $grupo->filter(fn($p) => $p->user_id !== null);
            
            // ¿Está el usuario logueado apuntado a esta sesión?
            $miRegistro = $alumnosReales->firstWhere('user_id', $user->id);
            
            $claseObj = new \stdClass();
            $claseObj->id_pago = $miRegistro?->id; // ID del registro específico del usuario (para borrarlo)
            $claseObj->session_key = [
                'fecha_hora' => $first->fecha_registro->format('Y-m-d H:i:s'),
                'nombre_clase' => $first->nombre_clase,
                'centro' => $first->centro
            ];
            $claseObj->nombre = $first->nombre_clase;
            $claseObj->tipo = $first->tipo_clase;
            $claseObj->fecha_hora = $first->fecha_registro;
            $claseObj->centro = $first->centro;
            $claseObj->ocupacion = $alumnosReales->count();
            $claseObj->capacidad = $this->getMaxCapacidad($first->tipo_clase);
            $claseObj->ya_reservada = ($miRegistro !== null);
            $claseObj->tiene_credito = $user->tieneCreditosPara($first->tipo_clase);
            
            $principal = $first->entrenador ?? $first->entrenadores->first();
            $claseObj->entrenador_nombre = $principal->nombre ?? 'Sin asignar';

            $clasesProcesadas[] = $claseObj;
        }

        // Agrupar por día para la vista
        $clasesAgrupadas = collect($clasesProcesadas)->groupBy(function ($c) {
            return $c->fecha_hora->format('Y-m-d');
        });

        return view('cliente.dashboard', compact('user', 'totalCreditos', 'clasesAgrupadas'));
    }

    /**
     * Procesar la reserva de una clase.
     */
    public function reservar(Request $request)
    {
        $request->validate([
            'fecha_hora' => 'required',
            'nombre_clase' => 'required',
            'centro' => 'required'
        ]);

        /** @var User $user */
        $user = Auth::user();
        
        // 1. Verificar si ya está reservada en Pagos
        $existe = Pago::where('user_id', $user->id)
            ->where('fecha_registro', $request->fecha_hora)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->exists();

        if ($existe) {
            return back()->with('error', 'Ya tienes una reserva para esta sesión.');
        }

        // 2. Obtener datos de la sesión para ver tipo y capacidad
        $first = Pago::where('fecha_registro', $request->fecha_hora)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->firstOrFail();

        $ocupacion = Pago::where('user_id', '!=', null)
            ->where('fecha_registro', $request->fecha_hora)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->count();

        $capacidad = $this->getMaxCapacidad($first->tipo_clase);

        if ($ocupacion >= $capacidad) {
            return back()->with('error', 'Lo sentimos, esta clase ya está completa.');
        }

        // 3. Ejecutar reserva
        try {
            DB::beginTransaction();

            // Descontar crédito (usando jerarquía)
            $centroModel = Centro::where('nombre', $first->centro)->first();
            $descontado = $user->descontarCredito($first->tipo_clase, $centroModel?->id);

            if (!$descontado) {
                DB::rollBack();
                return back()->with('error', 'No tienes créditos suficientes para este tipo de clase.');
            }

            // Crear el registro de Pago para el usuario
            Pago::create([
                'user_id' => $user->id,
                'entrenador_id' => $first->entrenador_id, // Copiar entrenador principal
                'centro' => $first->centro,
                'nombre_clase' => $first->nombre_clase,
                'tipo_clase' => $first->tipo_clase,
                'metodo_pago' => 'CREDITO',
                'importe' => 0,
                'fecha_registro' => $first->fecha_registro,
                'recurrence_group' => $first->recurrence_group,
            ]);

            DB::commit();
            return back()->with('success', '¡Reserva realizada con éxito!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Ocurrió un error al procesar la reserva: ' . $e->getMessage());
        }
    }

    /**
     * Permitir al usuario abandonar una clase.
     */
    public function abandonar(Request $request)
    {
        $request->validate([
            'pago_id' => 'required|exists:pagos,id'
        ]);

        /** @var User $user */
        $user = Auth::user();
        $pago = Pago::where('id', $request->pago_id)->where('user_id', $user->id)->firstOrFail();

        try {
            DB::beginTransaction();

            // Reembolsar crédito si pagó con crédito
            if ($pago->metodo_pago === 'CREDITO') {
                $centroModel = Centro::where('nombre', $pago->centro)->first();
                $user->reembolsarCredito($pago->tipo_clase, $centroModel?->id);
            }

            $pago->delete();

            DB::commit();
            return back()->with('success', 'Has abandonado la clase correctamente. Se ha reembolsado tu crédito.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al abandonar la clase.');
        }
    }

    /**
     * API para que FullCalendar obtenga las clases.
     */
    public function apiClases(Request $request)
    {
        /** @var User $user */
        $user = Auth::guard('web')->user() ?? Auth::guard('entrenador')->user();

        // Rango de búsqueda: desde el inicio de esta semana hasta 4 semanas vista
        $start = Carbon::now()->startOfWeek();
        $end = Carbon::now()->addWeeks(4)->endOfWeek();

        // Consultamos la tabla de pagos (sesiones)
        $query = Pago::with(['user', 'entrenadores', 'entrenador'])
            ->whereBetween('fecha_registro', [$start, $end]);

        // Filtrado por tipo de clase (desde el select del frontend)
        if ($request->has('tipo') && $request->tipo !== 'all') {
            $query->where('tipo_clase', 'LIKE', '%' . $request->tipo . '%');
        }

        $pagos = $query->orderBy('fecha_registro', 'asc')->get();

        // Agrupamos por sesión (fecha, nombre, centro)
        $grouped = $pagos->groupBy(function ($p) {
            return $p->fecha_registro->format('Y-m-d H:i:s') . '|' . strtolower(trim($p->nombre_clase)) . '|' . $p->centro;
        });

        $events = [];

        foreach ($grouped as $key => $grupo) {
            $first = $grupo->first();
            
            // Participantes reales (excluyendo el placeholder null)
            $alumnosReales = $grupo->filter(fn($p) => $p->user_id !== null);
            $count = $alumnosReales->count();

            // Capacidad máxima según el tipo de clase
            $capacidad = $this->getMaxCapacidad($first->tipo_clase);
            $isFull = $count >= $capacidad;

            // 1. Filtrado por créditos (si el toggle está activo)
            if ($request->boolean('compatible_only') && $user) {
                // Buscamos el ID del centro para ser más precisos con el crédito
                $centroModel = Centro::where('nombre', $first->centro)->first();
                if (!$user->tieneCreditosPara($first->tipo_clase, $centroModel?->id)) {
                    continue; // No mostrar si no es compatible
                }
            }

            // 2. Recopilar datos de fotos de alumnos
            $clientesData = $alumnosReales->map(function ($p) {
                return [
                    'nombre' => $p->user->name ?? 'Usuario',
                    'foto' => $p->user->foto_de_perfil ? asset('storage/' . $p->user->foto_de_perfil) : null,
                ];
            })->values();

            // 3. Entrenador principal y su foto
            $principal = $first->entrenador ?? $first->entrenadores->first();
            $entrenadorNombre = $principal->nombre ?? 'Sin asignar';
            $entrenadorFoto = $principal && $principal->foto_de_perfil ? asset('storage/' . $principal->foto_de_perfil) : null;

            // 4. Color según tipo
            $color = '#4BB7AE'; // Teal
            $tLower = strtolower($first->tipo_clase);
            if (str_contains($tLower, 'ep') || str_contains($tLower, 'personal')) $color = '#EF5D7A'; // Coral
            elseif (str_contains($tLower, 'duo')) $color = '#F6AD55'; // Orange
            elseif (str_contains($tLower, 'trio')) $color = '#4FD1C5'; // Aqua
            elseif (str_contains($tLower, 'privado')) $color = '#9F7AEA'; // Purple

            $events[] = [
                'id' => $first->id,
                'title' => $first->nombre_clase,
                'start' => $first->fecha_registro->toIso8601String(),
                'end' => $first->fecha_registro->copy()->addMinutes(60)->toIso8601String(), // Duración estimada
                'backgroundColor' => $color,
                'borderColor' => $color,
                'extendedProps' => [
                    'entrenador' => $entrenadorNombre,
                    'entrenador_foto' => $entrenadorFoto,
                    'clase' => $first->nombre_clase,
                    'tipo_clase' => $first->tipo_clase,
                    'ocupacion' => $count,
                    'capacidad' => $capacidad,
                    'isFull' => $isFull,
                    'clientes' => $clientesData,
                    'centro' => $first->centro,
                ]
            ];
        }

        return response()->json(array_values($events));
    }

    private function getMaxCapacidad($tipo)
    {
        $t = strtolower($tipo);
        if (str_contains($t, 'ep') || str_contains($t, 'personal')) return 1;
        if (str_contains($t, 'duo')) return 2;
        if (str_contains($t, 'trio')) return 3;
        return 12; // Grupos por defecto
    }
}
