<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use App\Models\Entrenador;
use App\Models\StandingReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PagosController extends Controller
{
    public function index()
    {
        $users = User::role('cliente')->orderBy('name')->get();
        $entrenadores = Entrenador::orderBy('nombre')->get();
        $centros = \App\Models\Centro::all();
        return view('Pagos.index', compact('users', 'entrenadores', 'centros'));
    }

    public function buscarPorUsuario(Request $request)
    {
        \Log::info('PagosController@buscarPorUsuario reached', $request->all());
        $nombre = trim((string) $request->input('q', ''));
        $centro = $request->input('centro');
        $start = $request->input('start');
        $end = $request->input('end');

        $query = Pago::with(['user', 'entrenadores']);

        if ($start) {
            try {
                $query->where('fecha_registro', '>=', Carbon::parse($start)->format('Y-m-d H:i:s'));
            } catch (\Exception $e) {
            }
        }
        if ($end) {
            try {
                $query->where('fecha_registro', '<=', Carbon::parse($end)->format('Y-m-d H:i:s'));
            } catch (\Exception $e) {
            }
        }

        if ($centro) {
            $query->where('centro', $centro);
        }

        if ($nombre !== '') {
            $query->whereHas('user', function ($sub) use ($nombre) {
                $sub->where('name', 'like', "%{$nombre}%");
            });
        }

        $pagos = $query->orderBy('fecha_registro', 'asc')->get();

        // Agrupar pagos por (fecha, nombre_clase, centro, tipo_clase)
        $grouped = $pagos->groupBy(function ($p) {
            return $p->fecha_registro->format('Y-m-d H:i:s') . '|' . strtolower(trim($p->nombre_clase)) . '|' . $p->centro;
        });

        $events = [];
        foreach ($grouped as $key => $grupo) {
            $first = $grupo->first();
            // Filtrar participantes reales (ignorando el placeholder si no hay alumnos)
            $alumnosReales = $grupo->filter(fn($p) => $p->user_id !== null);
            $count = $alumnosReales->count();

            // Determinar título
            if ($count === 0) {
                $title = $first->nombre_clase . ' (Vacía)';
            } elseif ($count === 1) {
                $title = $first->nombre_clase . ' - ' . ($alumnosReales->first()->user->name ?? 'Usuario');
            } else {
                $title = $first->nombre_clase . ' (' . $count . ')';
            }

            // Recopilar alumnos
            $alumnos = $alumnosReales->map(function ($p) {
                return [
                    'id' => $p->user_id,
                    'nombre' => $p->user->name ?? 'Invitado',
                    'pago' => $p->metodo_pago,
                    'coste' => (float) $p->importe
                ];
            })->values();

            // Recopilar entrenadores (únicos para el grupo)
            $entrenadoresMap = [];
            foreach ($grupo as $p) {
                if ($p->entrenadores) {
                    foreach ($p->entrenadores as $t) {
                        if (!isset($entrenadoresMap[$t->id])) {
                            $entrenadoresMap[$t->id] = [
                                'id' => $t->id,
                                'name' => $t->name,
                                'initial' => strtoupper(substr($t->name, 0, 1))
                            ];
                        }
                    }
                }
            }

            $entrenadoresList = array_values($entrenadoresMap);

            $centroUpper = strtoupper($first->centro);
            $color = '#A5EFE2'; // Default / Open Arena
            $textColor = '#1f2937';
            if (str_contains($centroUpper, 'AIRA')) {
                $color = '#4BB7AE';
                $textColor = '#ffffff';
            } elseif (str_contains($centroUpper, 'CLINICA')) {
                $color = '#EF5D7A';
                $textColor = '#ffffff';
            }

            $events[] = [
                'id' => $first->id,
                'groupId' => $key,
                'title' => $title,
                'start' => $first->fecha_registro ? $first->fecha_registro->toIso8601String() : null,
                'backgroundColor' => $color,
                'borderColor' => $color,
                'textColor' => $textColor,
                'extendedProps' => [
                    'hora' => $first->fecha_registro ? $first->fecha_registro->format('H:i') : '',
                    'centro' => $first->centro,
                    'clase_nombre' => $first->nombre_clase,
                    'tipo_clase' => $first->tipo_clase,
                    'alumnos' => $alumnos,
                    'entrenadores' => $entrenadoresList,
                    'session_key' => [
                        'fecha_hora' => $first->fecha_registro->format('Y-m-d H:i:s'),
                        'nombre_clase' => $first->nombre_clase,
                        'centro' => $first->centro
                    ]
                ],
            ];
        }

        return response()->json(['events' => $events]);
    }

    public function store(Request $request)
    {
        \Log::info('PagosController@store reached', $request->all());
        try {
        $request->validate([
            'centros' => ['nullable', 'array'],
            'centros.*' => ['string'],
            'centro' => ['nullable', 'string'],
            'nombre_clase' => ['required', 'string', 'max:120'],
            'tipo_clase' => ['required', 'string', 'in:ep,duo,trio,Grupo,Grupo especial,privado'],
            'fecha_hora' => ['required', 'date'],
            'trainers' => ['nullable', 'array'],
            'trainers.*' => ['exists:entrenadores,id'],
            'participants' => ['nullable', 'array'],
            'participants.*.user_id' => ['required', 'exists:users,id'],
            'participants.*.precio' => ['required', 'numeric', 'min:0'],
            'participants.*.metodo_pago' => ['required', 'in:TPV,EF,DD,CC,CREDITO'],
            'is_recurring' => ['nullable', 'boolean'],
            'recurrence_end' => ['nullable', 'required_if:is_recurring,true', 'date', 'after_or_equal:fecha_hora'],
        ]);

        $centros = $request->input('centros', []);
        if (empty($centros) && $request->input('centro')) {
            $centros = [$request->input('centro')];
        }

        if (empty($centros)) {
            return response()->json(['success' => false, 'message' => 'Debes seleccionar al menos un centro.'], 422);
        }

        $capacidad = $request->input('capacidad');
        $suscripciones_permitidas = $request->input('suscripciones_permitidas', []);
        
        $fechaInicio = Carbon::parse($request->input('fecha_hora'));
        $trainers = $request->input('trainers', []);
        $firstTrainerId = !empty($trainers) ? $trainers[0] : null;

        $isRecurring = $request->boolean('is_recurring');
        $recurrenceEnd = $isRecurring && $request->input('recurrence_end') ? Carbon::parse($request->input('recurrence_end'))->endOfDay() : $fechaInicio;
        $recurrenceGroup = $isRecurring ? (string) Str::uuid() : null;

        $totalSessionsCreated = 0;

        foreach ($centros as $centroNombre) {
            $centroObj = \App\Models\Centro::where('nombre', $centroNombre)->first();
            $id_centro = $centroObj ? $centroObj->id : null;

            $currentDate = $fechaInicio->copy();
            $sessionsCreatedForCenter = 0;

            while ($currentDate <= $recurrenceEnd) {
                $participants = $request->input('participants', []);
                
                // Comprobar capacidad si se ha definido
                if ($capacidad && count($participants) > $capacidad) {
                    return response()->json([
                        'success' => false,
                        'message' => "La capacidad máxima es de {$capacidad} personas. Has seleccionado " . count($participants)
                    ], 422);
                }

                if (empty($participants)) {
                    $placeholder = Pago::create([
                        'user_id' => null,
                        'entrenador_id' => $firstTrainerId,
                        'centro' => $centroNombre,
                        'nombre_clase' => $request->input('nombre_clase'),
                        'tipo_clase' => $request->input('tipo_clase'),
                        'capacidad' => $capacidad,
                        'suscripciones_permitidas' => !empty($suscripciones_permitidas) ? json_encode($suscripciones_permitidas) : null,
                        'metodo_pago' => 'EF',
                        'importe' => 0,
                        'fecha_registro' => $currentDate,
                        'recurrence_group' => $recurrenceGroup,
                    ]);
                    if (!empty($trainers)) $placeholder->entrenadores()->sync($trainers);
                } else {
                    foreach ($participants as $pData) {
                        $user = User::findOrFail($pData['user_id']);

                        if ($pData['metodo_pago'] === 'CREDITO') {
                            // Si hay suscripciones permitidas específicas, comprobar que el usuario tenga UNA de ellas activa y con saldo
                            if (!empty($suscripciones_permitidas)) {
                                $tieneSuscripcionValida = $user->suscripciones()
                                    ->where('estado', 'activo')
                                    ->where('saldo_actual', '>', 0)
                                    ->whereIn('id_suscripcion', $suscripciones_permitidas)
                                    ->exists();

                                if (!$tieneSuscripcionValida) {
                                    return response()->json([
                                        'success' => false,
                                        'message' => "El usuario {$user->name} no tiene ninguna de las suscripciones permitidas para esta clase."
                                    ], 422);
                                }
                                
                                // Descontar crédito de una de las permitidas
                                $su = $user->suscripciones()
                                    ->where('estado', 'activo')
                                    ->where('saldo_actual', '>', 0)
                                    ->whereIn('id_suscripcion', $suscripciones_permitidas)
                                    ->first();
                                $su->decrement('saldo_actual');
                            } else {
                                // Lógica por defecto (jerarquía)
                                if (!$user->tieneCreditosPara($request->tipo_clase, $id_centro)) {
                                    if ($currentDate->equalTo($fechaInicio)) {
                                        return response()->json([
                                            'success' => false,
                                            'message' => "El usuario {$user->name} no tiene créditos suficientes para: {$request->tipo_clase} en {$centroNombre}"
                                        ], 422);
                                    }
                                } else {
                                    $user->descontarCredito($request->tipo_clase, $id_centro);
                                }
                            }
                        }

                        $pago = Pago::create([
                            'user_id' => $user->id,
                            'entrenador_id' => $firstTrainerId,
                            'iban' => $user->iban ?? '',
                            'importe' => $pData['precio'],
                            'fecha_registro' => $currentDate,
                            'centro' => $centroNombre,
                            'nombre_clase' => $request->input('nombre_clase'),
                            'tipo_clase' => $request->input('tipo_clase'),
                            'capacidad' => $capacidad,
                            'suscripciones_permitidas' => !empty($suscripciones_permitidas) ? json_encode($suscripciones_permitidas) : null,
                            'metodo_pago' => $pData['metodo_pago'],
                            'recurrence_group' => $recurrenceGroup,
                        ]);

                        if (!empty($trainers)) $pago->entrenadores()->sync($trainers);

                        if ($currentDate->equalTo($fechaInicio) && ($pData['is_standing'] ?? false)) {
                            // ... (standing reservation logic remains same)
                            StandingReservation::updateOrCreate(
                                [
                                    'user_id' => $user->id,
                                    'dia_semana' => $currentDate->dayOfWeek,
                                    'hora_inicio' => $currentDate->format('H:i:s'),
                                    'centro' => $centroNombre
                                ],
                                [
                                    'nombre_clase' => $request->input('nombre_clase'),
                                    'tipo_clase' => $request->input('tipo_clase'),
                                    'precio' => $pData['precio'],
                                    'metodo_pago' => $pData['metodo_pago'],
                                ]
                            );
                        }
                    }
                }

                $currentDate->addWeek();
                $sessionsCreatedForCenter++;
                $totalSessionsCreated++;
                if (!$isRecurring || $sessionsCreatedForCenter > 52) break;
            }
        }

        return response()->json(['success' => true, 'message' => 'Clase creada exitosamente' . ($isRecurring ? " ($totalSessionsCreated sesiones en total)" : "")]);

    } catch (\Exception $e) {
        \Log::error('Error in PagosController@store: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'request' => $request->all()
        ]);
        return response()->json([
            'success' => false,
            'message' => 'Error interno: ' . $e->getMessage()
        ], 500);
    }
}

public function addTrainerToSession(Request $request)
{
    $request->validate([
        'trainer_id' => 'required|exists:entrenadores,id',
        'fecha_hora' => 'required|date',
        'nombre_clase' => 'required|string',
        'centro' => 'required|string'
    ]);

        if (!$request->user()->hasRole('admin')) {
            if ($request->user()->id != $request->trainer_id) {
                return response()->json(['error' => 'No tienes permiso.'], 403);
            }
        }

        $fecha = Carbon::parse($request->fecha_hora);
        $pagos = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->get();

        if ($pagos->isEmpty())
            return response()->json(['error' => 'No encontrada'], 404);

        foreach ($pagos as $pago) {
            if (!$pago->entrenadores()->where('user_id', $request->trainer_id)->exists()) {
                $pago->entrenadores()->attach($request->trainer_id);
                if (!$pago->entrenador_id) {
                    $pago->entrenador_id = $request->trainer_id;
                    $pago->save();
                }
            }
        }
        return response()->json(['success' => true, 'trainers' => $this->_getTrainersForSession($pagos)]);
    }

    public function removeTrainerFromSession(Request $request)
    {
        $request->validate(['trainer_id' => 'required|exists:users,id', 'fecha_hora' => 'required|date', 'nombre_clase' => 'required|string', 'centro' => 'required|string']);
        if (!$request->user()->hasRole('admin') && $request->user()->id != $request->trainer_id)
            return response()->json(['error' => 'No permiso'], 403);
        $fecha = Carbon::parse($request->fecha_hora);
        $pagos = Pago::where('fecha_registro', $fecha)->where('nombre_clase', $request->nombre_clase)->where('centro', $request->centro)->get();
        if ($pagos->isEmpty())
            return response()->json(['error' => 'No encontrada'], 404);

        foreach ($pagos as $pago) {
            $pago->entrenadores()->detach($request->trainer_id);
            if ($pago->entrenador_id == $request->trainer_id) {
                $next = $pago->entrenadores()->first();
                $pago->entrenador_id = $next ? $next->id : null;
                $pago->save();
            }
        }
        return response()->json(['success' => true, 'trainers' => $this->_getTrainersForSession($pagos)]);
    }

    public function addClientToSession(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id', 'fecha_hora' => 'required|date', 'nombre_clase' => 'required|string', 'centro' => 'required|string', 'metodo_pago' => 'nullable|in:TPV,EF,DD,CC,CREDITO']);
        if (!$request->user()->hasRole('admin'))
            return response()->json(['error' => 'No permiso'], 403);
        $fecha = Carbon::parse($request->fecha_hora);
        $pagosExistentes = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->get();
            
        $existingPago = $pagosExistentes->first();
        if (!$existingPago)
            return response()->json(['error' => 'No encontrada'], 404);

        // Comprobar capacidad
        if ($existingPago->capacidad) {
            $alumnosActuales = $pagosExistentes->filter(fn($p) => $p->user_id !== null)->count();
            if ($alumnosActuales >= $existingPago->capacidad) {
                return response()->json(['error' => "La clase está llena (Máx: {$existingPago->capacidad})"], 422);
            }
        }

        $metodo = $request->metodo_pago ?? $existingPago->metodo_pago;
        $user = User::findOrFail($request->user_id);
        $centroObj = \App\Models\Centro::where('nombre', $request->centro)->first();
        $id_centro = $centroObj ? $centroObj->id : null;

        if ($metodo === 'CREDITO') {
            $permitidas = $existingPago->suscripciones_permitidas ? json_decode($existingPago->suscripciones_permitidas, true) : [];
            
            if (!empty($permitidas)) {
                $tieneSuscripcionValida = $user->suscripciones()
                    ->where('estado', 'activo')
                    ->where('saldo_actual', '>', 0)
                    ->whereIn('id_suscripcion', $permitidas)
                    ->exists();

                if (!$tieneSuscripcionValida) {
                    return response()->json(['error' => "Este usuario no tiene una suscripción permitida para esta clase."], 422);
                }
                
                // Descontar
                $su = $user->suscripciones()
                    ->where('estado', 'activo')
                    ->where('saldo_actual', '>', 0)
                    ->whereIn('id_suscripcion', $permitidas)
                    ->first();
                $su->decrement('saldo_actual');
            } else {
                if (!$user->tieneCreditosPara($existingPago->tipo_clase, $id_centro))
                    return response()->json(['error' => 'Sin créditos'], 422);
                $user->descontarCredito($existingPago->tipo_clase, $id_centro);
            }
        }

        $newPago = Pago::create([
            'user_id' => $user->id,
            'entrenador_id' => $existingPago->entrenador_id,
            'iban' => $user->iban,
            'importe' => $existingPago->importe,
            'fecha_registro' => $fecha,
            'centro' => $existingPago->centro,
            'nombre_clase' => $existingPago->nombre_clase,
            'tipo_clase' => $existingPago->tipo_clase,
            'capacidad' => $existingPago->capacidad,
            'suscripciones_permitidas' => $existingPago->suscripciones_permitidas,
            'metodo_pago' => $metodo,
        ]);
        $newPago->entrenadores()->sync($existingPago->entrenadores->pluck('id')->toArray());
        return response()->json(['success' => true, 'message' => 'Cliente añadido']);
    }

    public function removeClientFromSession(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id', 'fecha_hora' => 'required|date', 'nombre_clase' => 'required|string', 'centro' => 'required|string']);
        
        $fecha = Carbon::parse($request->fecha_hora);
        $pago = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->where('user_id', $request->user_id)
            ->first();

        if ($pago) {
            // Si el admin borra al cliente, siempre reembolsamos si es crédito
            if ($pago->metodo_pago === 'CREDITO') {
                $user = User::find($pago->user_id);
                if ($user) {
                    $centroObj = \App\Models\Centro::where('nombre', $pago->centro)->first();
                    $user->reembolsarCredito($pago->tipo_clase, $centroObj ? $centroObj->id : null);
                }
            }
            $pago->delete();
        }

        return response()->json(['success' => true]);
    }

    private function _getTrainersForSession($pagos)
    {
        $entrenadores = collect();
        $pagos->each->load('entrenadores');
        foreach ($pagos as $p) {
            foreach ($p->entrenadores as $t) {
                if (!$entrenadores->contains('id', $t->id)) {
                    $entrenadores->push(['id' => $t->id, 'name' => $t->name, 'initial' => strtoupper(substr($t->name, 0, 1))]);
                }
            }
        }
        return $entrenadores->values();
    }

    public function getReporte(Request $request)
    {
        $request->validate(['type' => 'required|in:user,trainer', 'id' => 'required|integer|exists:users,id', 'start' => 'required|date', 'end' => 'required|date|after_or_equal:start']);
        $pagos = Pago::with(['user', 'entrenadores'])->whereBetween('fecha_registro', [Carbon::parse($request->start)->startOfDay(), Carbon::parse($request->end)->endOfDay()])
            ->when($request->type === 'user', fn($q) => $q->where('user_id', $request->id))
            ->when($request->type === 'trainer', fn($q) => $q->whereHas('entrenadores', fn($sq) => $sq->where('entrenadores.id', $request->id)))
            ->orderBy('fecha_registro', 'asc')->get();

        return response()->json([
            'persona' => User::find($request->id)->name,
            'resumen' => ['sesiones' => $pagos->count(), 'total' => number_format($pagos->sum('importe'), 2)],
            'detalles' => $pagos->map(fn($p) => ['fecha' => $p->fecha_registro->format('Y-m-d H:i'), 'clase' => $p->nombre_clase, 'centro' => $p->centro, 'alumno' => $p->user->name ?? '?', 'importe' => $p->importe, 'metodo' => $p->metodo_pago])
        ]);
    }

    public function deleteSession(Request $request)
    {
        $request->validate(['fecha_hora' => 'required|date', 'nombre_clase' => 'required|string', 'centro' => 'required|string']);
        
        $fecha = Carbon::parse($request->fecha_hora);
        $pagos = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->get();

        $ahora = Carbon::now();
        $diffHoras = $ahora->diffInHours($fecha, false);

        foreach ($pagos as $p) {
            if ($p->metodo_pago === 'CREDITO' && $diffHoras >= 0 && $p->user_id) {
                $user = User::find($p->user_id);
                if ($user) {
                    $centroObj = \App\Models\Centro::where('nombre', $p->centro)->first();
                    $user->reembolsarCredito($p->tipo_clase, $centroObj ? $centroObj->id : null);
                }
            }
            $p->delete();
        }

        return response()->json(['success' => true]);
    }
}