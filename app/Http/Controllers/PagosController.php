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

        $query = Pago::with(['user', 'entrenadores', 'suscripciones', 'tiposCredito']);

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

        // Obtener todos los tipos de sesión para mapear colores y datos
        $tiposSesionRaw = \App\Models\TipoSesion::all();
        $tiposSesion = $tiposSesionRaw->keyBy('nombre')->merge($tiposSesionRaw->keyBy('slug'));

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
        $activeCreditTypeIds = [];
        if ($isClientOnly) {
            // Obtenemos los IDs de tipos de crédito donde el usuario tiene saldo positivo y no caducado
            $activeCreditTypeIds = \App\Models\CreditoLote::validos()
                ->whereHas('suscripcionUsuario', function($q) use ($currentUser) {
                    $q->where('id_usuario', $currentUser->id);
                })
                ->pluck('tipo_credito_id')
                ->unique()
                ->toArray();
                
            // También mantenemos soporte para el mapeo por suscripción si fuera necesario
            $activeSubIds = $currentUser->suscripciones()
                ->where('estado', 'activo')
                ->pluck('id_suscripcion')
                ->toArray();
        }

        // Obtener centros para mapear sus colores
        $centrosColors = \App\Models\Centro::pluck('color_hex', 'nombre')->toArray();
        
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
                    'photo' => $p->user ? $p->user->photo : null
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
                                'photo' => $t->photo
                            ];
                        }
                    }
                }
            }
            $entrenadoresList = array_values($entrenadoresMap);

            // Colores Dinámicos (Prioridad: Tipo de Sesión -> Centro -> Default)
            $centroNombre = trim($first->centro);
            $tipoObj = $tiposSesion->get($tipoClase);
            $tipoColor = $tipoObj ? $tipoObj->color_hex : null;

            // Búsqueda insensible de color de centro
            $centroColor = null;
            foreach ($centrosColors as $name => $cHex) {
                if (strcasecmp(trim($name), $centroNombre) === 0) {
                    $centroColor = $cHex;
                    break;
                }
            }

            // Lógica de color final: El fondo será el del Tipo de Sesión si existe, 
            // si no, el del Centro. Si no, el azul por defecto.
            $color = $tipoColor ?? ($centroColor ?? '#38b2ac');
            $textColor = '#ffffff';

            $classSubIds = $first->suscripciones->pluck('id')->toArray();

            // Filtrado del lado del cliente: solo ve clases para las que existe una restricción de entrada
            if ($isClientOnly) {
                $classSubIds = $first->suscripciones->pluck('id')->toArray();
                $classCreditIds = $first->tiposCredito->pluck('id')->toArray();

                // Si la clase no tiene ninguna restricción de entrada, es una clase interna/privada de staff
                if (empty($classSubIds) && empty($classCreditIds)) continue;

                // [CAMBIO] Permitimos que vea la clase aunque no tenga saldo, para que el calendario no salga vacío.
                // La lógica de "apuntarse" ya se encarga de validar el saldo después.
                // $hasMatchingSub = !empty(array_intersect($activeSubIds, $classSubIds));
                // $hasMatchingCredit = !empty(array_intersect($activeCreditTypeIds, $classCreditIds));
                // if (!$hasMatchingSub && !$hasMatchingCredit) continue;
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
                    'centro_color' => $centroColor,
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
                    'suscripciones_detalles' => $first->suscripciones->map(fn($s) => ['id' => $s->id, 'nombre' => $s->nombre])->toArray(),
                    'tipos_credito_permitidos' => $first->tiposCredito->pluck('id')->toArray(),
                    'tipos_credito_detalles' => $first->tiposCredito->map(fn($t) => ['id' => $t->id, 'nombre' => $t->nombre])->toArray()
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
            'participants.*.precio'      => ['required_with:participants', 'numeric', 'min:0'],
            'participants.*.metodo_pago' => ['required_with:participants', 'in:TPV,EF,DD,CC'],
            'suscripciones_permitidas'   => ['nullable', 'array'],
            'suscripciones_permitidas.*' => ['exists:suscripciones,id'],
            'tipos_credito_permitidos'   => ['nullable', 'array'],
            'tipos_credito_permitidos.*' => ['exists:tipos_credito,id'],
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

        $tipoClaseInput = $request->input('tipo_clase');
        $tipoInfo = \App\Models\TipoSesion::where('slug', strtolower($tipoClaseInput))
            ->orWhere('nombre', $tipoClaseInput)
            ->first();

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
            $pagoList = [];
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
                    $pagoList[] = $pago;
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
                
                // --- MANEJO DE CRÉDITOS ---
                if ($request->has('tipos_credito_permitidos')) {
                    $pago->tiposCredito()->sync($request->input('tipos_credito_permitidos'));
                } elseif ($tipoInfo) {
                    // Si no se especifican, usar los predeterminados del tipo de sesión
                    $defaultCredits = $tipoInfo->tiposCredito->pluck('id')->toArray();
                    if (!empty($defaultCredits)) {
                        $pago->tiposCredito()->sync($defaultCredits);
                    }
                }

                if (!empty($trainers)) $pago->entrenadores()->sync($trainers);
                $pagoList[] = $pago;
            }

            // --- SINCRONIZACIÓN CON GOOGLE CALENDAR ---
            try {
                $calendarService = app(\App\Services\GoogleCalendarService::class);
                $sessionData = [
                    'nombre_clase' => $pagoBase['nombre_clase'],
                    'centro' => $pagoBase['centro'],
                    'tipo_clase' => $pagoBase['tipo_clase'],
                    'fecha_registro' => $slot,
                ];

                // Sincronizar para cada entrenador
                foreach ($trainers as $trainerId) {
                    $trainer = User::find($trainerId);
                    if ($trainer && $trainer->google_token) {
                        $calendarService->syncSession($sessionData, $trainer);
                    }
                }

                // Sincronizar para cada participante
                foreach ($pagoList as $p) {
                    if ($p->user && $p->user->google_token) {
                        $calendarService->syncSession($sessionData, $p->user);
                    }
                }
            } catch (\Exception $e) {
                \Log::warning('No se pudo sincronizar con Google Calendar: ' . $e->getMessage());
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
        $fechaStart = $fecha->copy()->startOfMinute();
        $fechaEnd = $fecha->copy()->endOfMinute();
        $nombreClase = trim($request->nombre_clase);
        $centro = trim($request->centro);

        // Buscar todos los pagos que coinciden con la "sesión"
        $pagos = Pago::whereBetween('fecha_registro', [$fechaStart, $fechaEnd])
            ->whereRaw('LOWER(TRIM(nombre_clase)) = ?', [strtolower($nombreClase)])
            ->whereRaw('LOWER(TRIM(centro)) = ?', [strtolower($centro)])
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
        $fechaStart = $fecha->copy()->startOfMinute();
        $fechaEnd = $fecha->copy()->endOfMinute();
        $nombreClase = trim($request->nombre_clase);
        $centro = trim($request->centro);

        $pagos = Pago::whereBetween('fecha_registro', [$fechaStart, $fechaEnd])
            ->whereRaw('LOWER(TRIM(nombre_clase)) = ?', [strtolower($nombreClase)])
            ->whereRaw('LOWER(TRIM(centro)) = ?', [strtolower($centro)])
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
        $fechaStart = $fecha->copy()->startOfMinute();
        $fechaEnd = $fecha->copy()->endOfMinute();

        $nombreClase = trim($request->nombre_clase);
        $centro = trim($request->centro);

        // 1. Buscar un pago existente de esa sesión para copiar datos (importe, tipo, método, entrenadores)
        $existingPago = Pago::whereBetween('fecha_registro', [$fechaStart, $fechaEnd])
            ->whereRaw('LOWER(TRIM(nombre_clase)) = ?', [strtolower($nombreClase)])
            ->whereRaw('LOWER(TRIM(centro)) = ?', [strtolower($centro)])
            ->first();

        if (!$existingPago) {
            return response()->json(['error' => 'Sesión no encontrada o vacía'], 404);
        }

        // 2. Verificar si el grupo tiene un límite y si ya se alcanzó
        if (!empty($existingPago->capacidad_maxima) && $existingPago->capacidad_maxima > 0) {
            $currentCount = Pago::whereBetween('fecha_registro', [$fechaStart, $fechaEnd])
                ->whereRaw('LOWER(TRIM(nombre_clase)) = ?', [strtolower($nombreClase)])
                ->whereRaw('LOWER(TRIM(centro)) = ?', [strtolower($centro)])
                ->whereNotNull('user_id')
                ->count();

            if ($currentCount >= $existingPago->capacidad_maxima) {
                return response()->json(['error' => 'Límite de alumnos alcanzado para esta sesión.'], 422);
            }
        }

        // 3. Verificar que el usuario no esté ya en esa sesión
        $exists = Pago::whereBetween('fecha_registro', [$fechaStart, $fechaEnd])
            ->whereRaw('LOWER(TRIM(nombre_clase)) = ?', [strtolower($nombreClase)])
            ->whereRaw('LOWER(TRIM(centro)) = ?', [strtolower($centro)])
            ->where('user_id', $request->user_id)
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'El usuario ya está inscrito en esta clase.'], 422);
        }

        $newUser = User::find($request->user_id);

        // 5. Verificar CRÉDITOS (ESTRICTO: Incluso Admin)
        $tipoInfo = \App\Models\TipoSesion::with('tiposCredito')
            ->where('nombre', $existingPago->tipo_clase)
            ->orWhere('slug', strtolower($existingPago->tipo_clase))
            ->orWhere('slug', $existingPago->tipo_clase)
            ->first();

        if (!$tipoInfo) {
            return response()->json(['error' => 'Tipo de sesión no encontrado: ' . $existingPago->tipo_clase], 422);
        }

        $allowedCreditIds = $existingPago->tiposCredito->pluck('id')->toArray();
        if (empty($allowedCreditIds)) {
            // Si no hay específicos en la clase, usamos los del tipo de sesión
            $allowedCreditIds = $tipoInfo->tiposCredito->pluck('id')->toArray();
        }

        $userSubsQuery = \App\Models\SuscripcionUsuario::where('id_usuario', $request->user_id)
            ->where('estado', 'activo');

        if (!empty($allowedCreditIds)) {
            $userSubsQuery->whereHas('lotes', function($q) use ($allowedCreditIds) {
                $q->validos()->whereIn('tipo_credito_id', $allowedCreditIds);
            });
        }

        $userSubs = $userSubsQuery->with(['suscripcion', 'lotes' => function($q) use ($allowedCreditIds) {
                $q->validos();
                if (!empty($allowedCreditIds)) {
                    $q->whereIn('tipo_credito_id', $allowedCreditIds);
                }
            }])
            ->get();
            
        // 6. Consumir Crédito
        // Buscamos el lote que vamos a consumir (el primero con saldo)
        $loteAConsumir = null;
        $activeSub = null;
        $hasCredits = false;
        foreach ($userSubs as $sub) {
            foreach ($sub->lotes as $lote) {
                if ($lote->cantidad_actual > 0) {
                    $loteAConsumir = $lote;
                    $activeSub = $sub;
                    $hasCredits = true;
                    break 2;
                }
            }
        }

        if (!$hasCredits || !$loteAConsumir) {
            return response()->json(['error' => 'No tienes créditos suficientes para esta clase.'], 422);
        }

        // Consumimos del lote específico
        $loteAConsumir->decrement('cantidad_actual', 1);

        // 7. Crear el nuevo pago
        $subNombre = ($activeSub && $activeSub->suscripcion) ? $activeSub->suscripcion->nombre : 'Bono';
        
        $newPago = Pago::create([
            'user_id' => $newUser->id,
            'entrenador_id' => $existingPago->entrenador_id,
            'iban' => $newUser->iban,
            'importe' => $tipoInfo->precio_base ?? $existingPago->importe,
            'fecha_registro' => $fecha,
            'centro' => $existingPago->centro,
            'nombre_clase' => $existingPago->nombre_clase,
            'tipo_clase' => $existingPago->tipo_clase,
            'capacidad_maxima' => $existingPago->capacidad_maxima,
            'horas_cancelacion' => $existingPago->horas_cancelacion,
            'metodo_pago' => "Bono ($subNombre)",
        ]);

        // Copiar suscripciones (solo la usada), créditos y entrenadores
        $newPago->suscripciones()->sync([$activeSub->id_suscripcion]);

        $credits = $existingPago->tiposCredito->pluck('id')->toArray();
        if (!empty($credits)) $newPago->tiposCredito()->sync($credits);

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
        $fechaStart = $fecha->copy()->startOfMinute();
        $fechaEnd = $fecha->copy()->endOfMinute();

        $nombreClase = trim($request->nombre_clase);
        $centro = trim($request->centro);

        $pago = Pago::whereBetween('fecha_registro', [$fechaStart, $fechaEnd])
            ->whereRaw('LOWER(TRIM(nombre_clase)) = ?', [strtolower($nombreClase)])
            ->whereRaw('LOWER(TRIM(centro)) = ?', [strtolower($centro)])
            ->where('user_id', $request->user_id)
            ->first();

        if ($pago) {
            $isSelf = ($request->user()->id == $request->user_id);
            $mainMessage = $isSelf ? 'Te has dado de baja de la clase.' : 'El cliente ha sido dado de baja de la clase.';
            $messageSuffix = '';

            // 3. LOGICA RE-ABONO (CRÉDITOS)
            $diffHours = now()->diffInHours($fecha, false); 
            $horasCancelacion = $pago->horas_cancelacion ?? 0;
            
            $tipoInfo = \App\Models\TipoSesion::where('nombre', $pago->tipo_clase)
                ->orWhere('slug', strtolower($pago->tipo_clase))
                ->orWhere('slug', $pago->tipo_clase)
                ->first();

            if ($diffHours >= $horasCancelacion) {
                $allowedCreditIds = $pago->tiposCredito->pluck('id')->toArray();
                if (empty($allowedCreditIds) && $tipoInfo) {
                    $allowedCreditIds = $tipoInfo->tiposCredito->pluck('id')->toArray();
                }

                $userSub = \App\Models\SuscripcionUsuario::where('id_usuario', $request->user_id)
                    ->where('estado', 'activo')
                    ->first();
                
                if ($userSub && !empty($allowedCreditIds)) {
                    $tipoCreditoId = $allowedCreditIds[0];
                    app(\App\Services\CreditService::class)->allocate($userSub, $tipoCreditoId, 1, 30, $pago->id);
                    $messageSuffix = $isSelf ? ' El crédito ha sido devuelto a tu cuenta.' : ' El crédito ha sido devuelto a la cuenta del cliente.';
                }
            } else {
                $messageSuffix = ' Cancelación fuera de plazo: no se ha devuelto el crédito.';
            }

            $pago->delete();
            return response()->json(['success' => true, 'message' => $mainMessage . $messageSuffix]);
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
            'tipos_credito_permitidos' => 'nullable|array',
            'tipos_credito_permitidos.*' => 'exists:tipos_credito,id',
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

            // Sync allowed credits for this session
            if ($request->has('tipos_credito_permitidos')) {
                $pago->tiposCredito()->sync($request->input('tipos_credito_permitidos'));
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