<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PagosController extends Controller
{

    public function buscarPorUsuario(Request $request)
    {
        $nombre = trim((string) $request->input('q', ''));
        $centro = $request->input('centro');
        $start = $request->input('start');
        $end = $request->input('end');

        $query = Pago::with(['user', 'entrenadores', 'suscripciones']);

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
            $query->whereIn(DB::raw("(fecha_registro, nombre_clase, centro)"), function($sub) use ($nombre) {
                $sub->select('fecha_registro', 'nombre_clase', 'centro')
                    ->from('pagos')
                    ->where('nombre_clase', 'like', "%{$nombre}%")
                    ->orWhereExists(function($sq) use ($nombre) {
                        $sq->select(DB::raw(1))
                           ->from('users')
                           ->whereColumn('users.id', 'pagos.user_id')
                           ->where('name', 'like', "%{$nombre}%");
                    })
                    ->orWhereExists(function($sq) use ($nombre) {
                        $sq->select(DB::raw(1))
                           ->from('pago_entrenador')
                           ->join('entrenadores', 'entrenadores.id', '=', 'pago_entrenador.entrenador_id')
                           ->whereColumn('pago_entrenador.pago_id', 'pagos.id')
                           ->where('entrenadores.name', 'like', "%{$nombre}%");
                    });
            });
        }

        $pagos = $query->orderBy('fecha_registro', 'asc')->get();

        // Obtener todos los tipos de sesión para mapear colores
        $tiposSesion = \App\Models\TipoSesion::all()->keyBy('nombre');

        // Agrupar pagos por (fecha, nombre_clase, centro, tipo_clase)
        $grouped = $pagos->groupBy(function ($p) {
            return $p->fecha_registro->format('Y-m-d H:i:s')
                . '|' . strtoupper(trim($p->tipo_clase ?? ''))
                . '|' . strtolower(trim($p->nombre_clase))
                . '|' . $p->centro;
        });

        // Extraer roles del request
        $currentUser = request()->user();
        $isClientOnly = $currentUser && $currentUser->hasRole('cliente') && !$currentUser->hasRole('admin') && !$currentUser->hasRole('entrenador');
        $activeSubIds = [];
        if ($isClientOnly) {
            $activeSubIds = $currentUser->suscripciones()
                ->where('saldo_actual', '>', 0)
                ->pluck('id_suscripcion')
                ->toArray();
        }

        $events = [];
        foreach ($grouped as $key => $grupo) {
            $first = $grupo->first();
            $count = $grupo->filter(fn($p) => $p->user_id !== null)->count();

            $tipoClase = $grupo->pluck('tipo_clase')->filter()->first() ?? $first->tipo_clase;
            $capacidadMaxima = $grupo->pluck('capacidad_maxima')->filter()->first() ?? $first->capacidad_maxima;

            // Determinar título
            if ($count === 1) {
                $userSingle = $grupo->filter(fn($p) => $p->user_id !== null)->first();
                $title = $first->nombre_clase . ' - ' . ($userSingle->user->name ?? 'Usuario');
            } else {
                $title = $first->nombre_clase . ' (' . $count . ')';
            }

            // Recopilar alumnos
            $alumnos = $grupo->filter(fn($p) => $p->user_id !== null)->map(function ($p) {
                return [
                    'id' => $p->user_id,
                    'nombre' => $p->user->name ?? 'Usuario',
                    'pago' => $p->metodo_pago,
                    'coste' => (float) $p->importe,
                    'foto' => ($p->user && $p->user->foto_de_perfil) ? \Storage::url($p->user->foto_de_perfil) : null
                ];
            })->values();

            // Recopilar entrenadores
            $entrenadoresMap = [];
            foreach ($grupo as $p) {
                if ($p->entrenadores) {
                    foreach ($p->entrenadores as $t) {
                        if (!isset($entrenadoresMap[$t->id])) {
                            $entrenadoresMap[$t->id] = [
                                'id' => $t->id,
                                'name' => $t->name,
                                'initial' => strtoupper(substr($t->name, 0, 1)),
                                'foto' => $t->foto_de_perfil ? \Storage::url($t->foto_de_perfil) : null
                            ];
                        }
                    }
                }
            }
            $entrenadoresList = array_values($entrenadoresMap);

            // Colores por Centro (Mejorado)
            $centroUpper = strtoupper($first->centro);
            $color = '#cbd5e1'; // Default slate-300
            $textColor = '#1e293b';
            
            if (str_contains($centroUpper, 'AIRA')) {
                $color = '#38b2ac'; // teal-500
                $textColor = '#ffffff';
            } elseif (str_contains($centroUpper, 'CLINICA')) {
                $color = '#e11d48'; // rose-600
                $textColor = '#ffffff';
            } elseif (str_contains($centroUpper, 'ARENA')) {
                $color = '#0ea5e9'; // sky-500
                $textColor = '#ffffff';
            }

            // Color del Tipo de Sesión
            $tipoObj = $tiposSesion->get($tipoClase);
            $tipoColor = $tipoObj ? $tipoObj->color_hex : null;

            $classSubIds = $first->suscripciones->pluck('id')->toArray();

            // Filtrado del lado del cliente
            if (isset($isClientOnly) && $isClientOnly) {
                if (empty($classSubIds)) continue;
                $hasMatchingSub = !empty(array_intersect($activeSubIds, $classSubIds));
                if (!$hasMatchingSub) continue;
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
                    'tipo_clase' => $tipoClase,
                    'tipo_color' => $tipoColor,
                    'capacidad_maxima' => $capacidadMaxima,
                    'alumnos_count' => $count,
                    'alumnos' => $alumnos,
                    'entrenadores' => $entrenadoresList,
                    'session_key' => [
                        'fecha_hora' => $first->fecha_registro->format('Y-m-d H:i:s'),
                        'nombre_clase' => $first->nombre_clase,
                        'centro' => $first->centro
                    ],
                    'suscripciones_permitidas' => $classSubIds,
                    'suscripciones_detalles' => $first->suscripciones->map(fn($s) => ['id' => $s->id, 'nombre' => $s->nombre])->toArray()
                ],
            ];
        }

        return response()->json(['events' => $events]);
    }

    public function store(Request $request)
    {
        $tiposGrupo = ['GRUPO', 'GRUPO_PRIVADO'];
        $isGrupo    = in_array($request->input('tipo_clase'), $tiposGrupo);

        $request->validate([
            'centro'             => ['required', 'string'],
            'nombre_clase'       => ['required', 'string', 'max:120'],
            'tipo_clase'         => ['required', 'string'],
            'fecha_hora'         => ['required', 'date'],
            'capacidad_maxima'   => ['nullable', 'integer', 'min:1'],
            'trainers'           => ['nullable', 'array'],
            'trainers.*'         => ['exists:entrenadores,id'],
            'participants'       => ['nullable', 'array'],
            'participants.*.user_id'     => ['required_with:participants', 'exists:users,id'],
            'participants.*.precio'      => ['required_with:participants', 'numeric', 'gt:0'],
            'participants.*.metodo_pago' => ['required_with:participants', 'in:TPV,EF,DD,CC'],
            'suscripciones_permitidas'   => ['nullable', 'array'],
            'suscripciones_permitidas.*' => ['exists:suscripciones,id'],
            'horas_cancelacion'          => ['nullable', 'integer'],
        ]);

        $user = auth()->user();
        // Si es entrenador, verificar permiso de creación
        if ($user->hasRole('entrenador') && !$user->can('crear_clases')) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para crear clases.'], 403);
        }

        $fecha          = Carbon::parse($request->input('fecha_hora'));
        $trainers       = $request->input('trainers', []);
        $firstTrainerId = !empty($trainers) ? $trainers[0] : null;
        $capacidad      = $request->input('capacidad_maxima');
        $participants   = $request->input('participants', []);

        $tipoInfo = \App\Models\TipoSesion::where('nombre', $request->input('tipo_clase'))->first();
        $horasCancelacion = $request->input('horas_cancelacion') !== null ? $request->input('horas_cancelacion') : ($tipoInfo->horas_cancelacion_default ?? 0);

        $pagoBase = [
            'entrenador_id'    => $firstTrainerId,
            'centro'           => $request->input('centro'),
            'nombre_clase'     => $request->input('nombre_clase'),
            'tipo_clase'       => $request->input('tipo_clase'),
            'capacidad_maxima' => $capacidad,
            'horas_cancelacion' => $horasCancelacion,
            'importe'          => 0,
        ];

        // Closure: crea los pagos para una fecha concreta
        $crearPagos = function (Carbon $slot) use ($participants, $pagoBase, $trainers, $request, $isGrupo) {
            if (!empty($participants)) {
                foreach ($participants as $pData) {
                    $user = User::find($pData['user_id']);
                    if (!$user) continue;

                    $pago = Pago::create(array_merge($pagoBase, [
                        'user_id'        => $user->id,
                        'iban'           => $user->iban,
                        'importe'        => $pData['precio'] ?? 0,
                        'metodo_pago'    => $pData['metodo_pago'] ?? 'EF',
                        'fecha_registro' => $slot,
                    ]));

                    if ($request->has('suscripciones_permitidas')) {
                        $pago->suscripciones()->sync($request->input('suscripciones_permitidas'));
                    }
                    if (!empty($trainers)) $pago->entrenadores()->sync($trainers);
                }
            } else {
                // Sin alumnos: placeholder para que la sesión aparezca en el calendario
                $pago = Pago::create(array_merge($pagoBase, [
                    'user_id'        => null,
                    'metodo_pago'    => null,
                    'fecha_registro' => $slot,
                ]));

                if ($request->has('suscripciones_permitidas')) {
                    $pago->suscripciones()->sync($request->input('suscripciones_permitidas'));
                }
                if (!empty($trainers)) $pago->entrenadores()->sync($trainers);
            }
        };

        try {
            $crearPagos($fecha);

            if ($request->input('is_recurring') && $request->input('recurrence_end')) {
                $endDate     = Carbon::parse($request->input('recurrence_end'));
                $currentDate = $fecha->copy()->addWeek();
                while ($currentDate->lte($endDate)) {
                    $crearPagos($currentDate->copy());
                    $currentDate->addWeek();
                }
            }

        } catch (\Exception $e) {
            \Log::error('PagosController@store error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Error interno: ' . $e->getMessage()], 500);
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Clase creada exitosamente']);
        }

        return redirect()->route('Pagos')->with('success', 'Clase creada exitosamente.');
    }

    // Método para añadir entrenador a una sesión completa
    public function addTrainerToSession(Request $request)
    {
        $request->validate([
            'trainer_id'  => 'required|exists:entrenadores,id',
            'fecha_hora'  => 'required|date',
            'nombre_clase' => 'required|string',
            'centro'      => 'required|string'
        ]);

        if (!$request->user()->hasRole('admin')) {
            // Si no es admin, solo puede agregarse a sí mismo
            if ($request->user()->id != $request->trainer_id) {
                return response()->json(['error' => 'No tienes permiso para modificar otros entrenadores.'], 403);
            }
        }

        $fecha = Carbon::parse($request->fecha_hora);

        // Buscar todos los pagos que coinciden con la "sesión"
        $pagos = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->get();

        if ($pagos->isEmpty()) {
            return response()->json(['error' => 'Sesión no encontrada'], 404);
        }

        foreach ($pagos as $pago) {
            /** @var \App\Models\Pago $pago */
            // Attach si no existe ya
            if (!$pago->entrenadores()->where('entrenadores.id', $request->trainer_id)->exists()) {
                $pago->entrenadores()->attach($request->trainer_id);

                // Actualizar legacy column si estaba vacía
                if (!$pago->entrenador_id) {
                    $pago->entrenador_id = $request->trainer_id;
                    $pago->save();
                }
            }
        }

        // Devolver la lista actualizada de entrenadores
        $updatedTrainers = $this->_getTrainersForSession($pagos);

        return response()->json([
            'success' => true,
            'trainers' => $updatedTrainers
        ]);
    }

    // Método para quitar entrenador de una sesión completa
    public function removeTrainerFromSession(Request $request)
    {
        $request->validate([
            'trainer_id'  => 'required|exists:entrenadores,id',
            'fecha_hora'  => 'required|date',
            'nombre_clase' => 'required|string',
            'centro'      => 'required|string'
        ]);

        if (!$request->user()->hasRole('admin')) {
            // Si no es admin, solo puede quitarse a sí mismo
            if ($request->user()->id != $request->trainer_id) {
                return response()->json(['error' => 'No tienes permiso para modificar otros entrenadores.'], 403);
            }
        }

        $fecha = Carbon::parse($request->fecha_hora);

        $pagos = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->get();

        if ($pagos->isEmpty()) {
            return response()->json(['error' => 'Sesión no encontrada'], 404);
        }

        foreach ($pagos as $pago) {
            /** @var \App\Models\Pago $pago */
            $pago->entrenadores()->detach($request->trainer_id);

            // Si quitamos el que estaba en legacy column, ponemos otro o null
            if ($pago->entrenador_id == $request->trainer_id) {
                $next = $pago->entrenadores()->first();
                $pago->entrenador_id = $next ? $next->id : null;
                $pago->save();
            }
        }

        // Devolver la lista actualizada de entrenadores
        $updatedTrainers = $this->_getTrainersForSession($pagos);

        return response()->json([
            'success' => true,
            'trainers' => $updatedTrainers
        ]);
    }

    // Método para AÑADIR CLIENTE a una sesión existente
    public function addClientToSession(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        if (!$request->user()->hasRole('admin')) {
            if ($request->user()->id != $request->user_id) {
                return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
            }
        }

        $fecha = Carbon::parse($request->fecha_hora);

        // 1. Buscar un pago existente de esa sesión para copiar datos (importe, tipo, método, entrenadores)
        $existingPago = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->first();

        if (!$existingPago) {
            return response()->json(['error' => 'Sesión no encontrada o vacía'], 404);
        }

        // 2. Verificar si el grupo tiene un límite y si ya se alcanzó
        if (!empty($existingPago->capacidad_maxima) && $existingPago->capacidad_maxima > 0) {
            $currentCount = Pago::where('fecha_registro', $fecha)
                ->where('nombre_clase', $request->nombre_clase)
                ->where('centro', $request->centro)
                ->whereNotNull('user_id')
                ->count();

            if ($currentCount >= $existingPago->capacidad_maxima) {
                return response()->json(['error' => 'Límite de alumnos alcanzado para esta sesión.'], 422);
            }
        }

        // 3. Verificar que el usuario no esté ya en esa sesión
        $exists = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->where('user_id', $request->user_id)
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'El usuario ya está inscrito en esta clase.'], 422);
        }

        $newUser = User::find($request->user_id);

        // 5. Verificar CRÉDITOS (ESTRICTO: Incluso Admin)
        $allowedSubIds = $existingPago->suscripciones->pluck('id')->toArray();
        $userSubs = \App\Models\SuscripcionUsuario::where('id_usuario', $request->user_id)
            ->whereIn('id_suscripcion', $allowedSubIds)
            ->where('estado', 'activo')
            ->get();
            
        $hasCredits = false;
        $activeSub = null;
        foreach ($userSubs as $sub) {
            if ($sub->saldo_actual_calculado > 0) {
                $hasCredits = true;
                $activeSub = $sub;
                break;
            }
        }

        if (!$hasCredits) {
            return response()->json(['error' => 'No tienes créditos suficientes para esta clase.'], 422);
        }

        // 6. Consumir Crédito
        app(\App\Services\CreditService::class)->consume($activeSub, 1);

        // 7. Crear el nuevo pago
        $newPago = Pago::create([
            'user_id' => $newUser->id,
            'entrenador_id' => $existingPago->entrenador_id,
            'iban' => $newUser->iban,
            'importe' => $existingPago->importe,
            'fecha_registro' => $fecha,
            'centro' => $existingPago->centro,
            'nombre_clase' => $existingPago->nombre_clase,
            'tipo_clase' => $existingPago->tipo_clase,
            'capacidad_maxima' => $existingPago->capacidad_maxima,
            'horas_cancelacion' => $existingPago->horas_cancelacion,
            'metodo_pago' => 'Bono',
        ]);

        // Copiar suscripciones y entrenadores
        $subs = $existingPago->suscripciones->pluck('id')->toArray();
        if (!empty($subs)) $newPago->suscripciones()->sync($subs);

        $trainers = $existingPago->entrenadores->pluck('id')->toArray();
        if (!empty($trainers)) $newPago->entrenadores()->sync($trainers);

        return response()->json(['success' => true, 'message' => 'Cliente añadido y crédito consumido correctamente.']);
    }

    // Método para ELIMINAR CLIENTE de una sesión
    public function removeClientFromSession(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        if (!$request->user()->hasRole('admin')) {
            if ($request->user()->id != $request->user_id) {
                return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
            }
        }

        $fecha = Carbon::parse($request->fecha_hora);

        $pago = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->where('user_id', $request->user_id)
            ->first();

        if ($pago) {
            // 3. LOGICA RE-ABONO (CRÉDITOS)
            $diffHours = now()->diffInHours($fecha, false); 
            $horasCancelacion = $pago->horas_cancelacion ?? 0;
            
            $messageSuffix = '';
            if ($diffHours >= $horasCancelacion) {
                $allowedSubIds = $pago->suscripciones->pluck('id')->toArray();
                $userSub = \App\Models\SuscripcionUsuario::where('id_usuario', $request->user_id)
                    ->whereIn('id_suscripcion', $allowedSubIds)
                    ->where('estado', 'activo')
                    ->first();
                
                if ($userSub) {
                    app(\App\Services\CreditService::class)->refund($userSub, 1);
                    $messageSuffix = ' El crédito ha sido devuelto a tu cuenta.';
                }
            } else {
                $messageSuffix = ' Cancelación fuera de plazo: no se ha devuelto el crédito.';
            }

            $pago->delete();
            return response()->json(['success' => true, 'message' => 'Te has dado de baja de la clase.' . $messageSuffix]);
        } else {
            return response()->json(['error' => 'No se encontró el registro para eliminar'], 404);
        }
    }

    private function _getTrainersForSession($pagos)
    {
        $entrenadores = collect();
        // Recargar las relaciones para tener datos frescos
        $pagos->each->load('entrenadores');

        $pagos->each(function ($p) use ($entrenadores) {
            foreach ($p->entrenadores as $t) {
                if (!$entrenadores->contains('id', $t->id)) {
                    $entrenadores->push([
                        'id' => $t->id,
                        'name' => $t->name,
                        'initial' => strtoupper(substr($t->name, 0, 1))
                    ]);
                }
            }
        });
        return $entrenadores->values();
    }
    public function getReporte(Request $request)
    {
        $request->validate([
            'type' => 'required|in:user,trainer',
            'id' => 'required|integer|exists:users,id',
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);

        $start = \Carbon\Carbon::parse($request->start)->startOfDay();
        $end = \Carbon\Carbon::parse($request->end)->endOfDay();
        $type = $request->type;
        $id = $request->id;

        $query = Pago::with(['user', 'entrenadores'])
            ->whereBetween('fecha_registro', [$start, $end]);

        if ($type === 'user') {
            $query->where('user_id', $id);
            $persona = User::find($id);
        } else {
            // Entrenador: Buscar en la relación muchos a muchos
            $query->whereHas('entrenadores', function ($q) use ($id) {
                $q->where('users.id', $id);
            });
            $persona = User::find($id);
        }

        $pagos = $query->orderBy('fecha_registro', 'asc')->get();

        // Calcular totales
        $totalSesiones = $pagos->count();
        $totalImporte = $pagos->sum('importe');

        // Formatear para la tabla
        $detalles = $pagos->map(function ($p) {
            return [
                'fecha' => $p->fecha_registro->format('Y-m-d H:i'),
                'clase' => $p->nombre_clase,
                'centro' => $p->centro,
                'alumno' => $p->user->name ?? 'Desconocido',
                'importe' => $p->importe,
                'metodo' => $p->metodo_pago
            ];
        });

        return response()->json([
            'persona' => $persona ? $persona->name : 'Desconocido',
            'resumen' => [
                'sesiones' => $totalSesiones,
                'total' => number_format($totalImporte, 2)
            ],
            'detalles' => $detalles
        ]);
    }

    public function updateSession(Request $request)
    {
        $request->validate([
            'old_fecha_hora' => 'required|date',
            'old_nombre_clase' => 'required|string',
            'old_centro' => 'required|string',

            'new_fecha_hora' => 'required|date',
            'new_nombre_clase' => 'required|string|max:200',
            'new_centro' => 'required|string',
            'new_tipo_clase' => 'required|string',
            'capacidad_maxima' => 'nullable|integer|min:1',
            'suscripciones_permitidas' => 'nullable|array',
            'suscripciones_permitidas.*' => 'exists:suscripciones,id',
        ]);

        if (!$request->user()->hasRole('admin')) {
            return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
        }

        $oldFecha = Carbon::parse($request->old_fecha_hora);
        $newFecha = Carbon::parse($request->new_fecha_hora);

        // Find all payments that belong to this "session"
        $pagos = Pago::where('fecha_registro', $oldFecha)
            ->where('nombre_clase', $request->old_nombre_clase)
            ->where('centro', $request->old_centro)
            ->get();

        if ($pagos->isEmpty()) {
            return response()->json(['error' => 'Sesión no encontrada'], 404);
        }

        foreach ($pagos as $pago) {
            /** @var Pago $pago */
            $pago->update([
                'fecha_registro' => $newFecha,
                'nombre_clase' => $request->new_nombre_clase,
                'centro' => $request->new_centro,
                'tipo_clase' => $request->new_tipo_clase,
                'capacidad_maxima' => $request->capacidad_maxima,
            ]);

            // Sync allowed subscriptions for this session
            if ($request->has('suscripciones_permitidas')) {
                $pago->suscripciones()->sync($request->input('suscripciones_permitidas'));
            } else {
                $pago->suscripciones()->detach();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesión actualizada correctamente'
        ]);
    }

    public function deleteSession(Request $request)
    {
        $request->validate([
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        if (!$request->user()->hasRole('admin')) {
            return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
        }

        $fecha = \Carbon\Carbon::parse($request->fecha_hora);

        // Borrar todos los pagos que coinciden con la sesión
        $deletedCount = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->delete();

        if ($deletedCount === 0) {
            return response()->json(['error' => 'No se encontraron registros para eliminar'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Se han eliminado {$deletedCount} registros correctamente."
        ]);
    }

    public function destroySingle(Pago $pago)
    {
        // Seguridad: Solo admin o el que lo creó (si aplica)
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'No tienes permiso para eliminar este registro.'], 403);
        }

        $pago->delete();
        return response()->json(['success' => true, 'message' => 'Registro eliminado correctamente.']);
    }

    public function updateSingle(Request $request, Pago $pago)
    {
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'No tienes permiso para editar este registro.'], 403);
        }

        $validated = $request->validate([
            'importe' => 'required|numeric',
            'metodo_pago' => 'required|string',
            'fecha_registro' => 'required|date',
            'nombre_clase' => 'nullable|string'
        ]);

        $pago->update($validated);

        return response()->json(['success' => true, 'message' => 'Registro actualizado correctamente.', 'pago' => $pago]);
    }
}