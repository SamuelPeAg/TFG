<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PagosController extends Controller
{
    public function index()
    {
        $users = User::role('cliente')->orderBy('name')->get();
        $entrenadores = User::role('entrenador')->orderBy('name')->get();
        return view('Pagos.index', compact('users', 'entrenadores'));
    }

    public function buscarPorUsuario(Request $request)
    {
        $nombre = trim((string) $request->input('q', ''));

        $query = Pago::with(['user', 'entrenadores']);

        if ($nombre !== '') {
            $query->whereHas('user', function ($q) use ($nombre) {
                $q->where('name', 'like', "%{$nombre}%");
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
            $count = $grupo->count();
            
            // Determinar título
            if ($count === 1) {
                $title = $first->nombre_clase . ' - ' . ($first->user->name ?? 'Usuario');
            } else {
                $title = $first->nombre_clase . ' (' . $count . ')';
            }

            // Recopilar alumnos
            $alumnos = $grupo->map(function ($p) {
                return [
                    'id' => $p->user_id,
                    'nombre' => $p->user->name ?? 'Desconocido',
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

            $events[] = [
                'id' => $first->id, 
                // Usamos propiedades personalizadas para identificar la sesión única y poder editar todos
                'groupId' => $key, 
                'title' => $title,
                'start' => $first->fecha_registro ? $first->fecha_registro->toIso8601String() : null,
                'backgroundColor' => '#00897b',
                'borderColor' => '#00897b',
                'textColor' => '#ffffff',
                'extendedProps' => [
                    'hora' => $first->fecha_registro ? $first->fecha_registro->format('H:i') : '',
                    'centro' => $first->centro,
                    'clase_nombre' => $first->nombre_clase,
                    'tipo_clase' => $first->tipo_clase,
                    'alumnos' => $alumnos,
                    'entrenadores' => $entrenadoresList, // Array de entrenadores
                    // Datos clave para identificar la sesión al añadir/quitar entrenadores
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
        $data = $request->validate([
            'users'        => ['required', 'array', 'min:1'],
            'users.*'      => ['exists:users,id'],
            'trainers'     => ['nullable', 'array'],
            'trainers.*'   => ['exists:users,id'],
            'centro'       => ['required', 'in:CLINICA,AIRA,OPEN'],
            'nombre_clase' => ['required', 'string', 'max:120'],
            'tipo_clase'   => ['required', 'string', 'in:EP,DUO,TRIO,GRUPO,GRUPO_PRIVADO'],
            'metodo_pago'  => ['required', 'in:TPV,EF,DD,CC'],
            'fecha_hora'   => ['required', 'date'],
            'precio'       => ['required', 'numeric', 'min:0'],
        ], [
            'users.required' => 'Debes seleccionar al menos un usuario.',
            'users.array' => 'Formato de usuarios incorrecto.',
            'users.*.exists' => 'El usuario seleccionado no existe o no es válido.',
            'centro.required' => 'El centro es obligatorio.',
        ]);

        $fecha = Carbon::parse($data['fecha_hora']);
        $createdEvents = [];
        
        // Entrenadores seleccionados
        $trainers = $data['trainers'] ?? [];
        $firstTrainerId = !empty($trainers) ? $trainers[0] : null;

        foreach ($data['users'] as $userId) {
            $user = User::findOrFail($userId);
            
            $pago = Pago::create([
                'user_id'        => $user->id,
                'entrenador_id'  => $firstTrainerId, // Legacy: primer entrenador
                'iban'           => $user->iban,
                'importe'        => $data['precio'], 
                'fecha_registro' => $fecha,
                'centro'         => $data['centro'],
                'nombre_clase'   => $data['nombre_clase'],
                'tipo_clase'     => $data['tipo_clase'],
                'metodo_pago'    => $data['metodo_pago'],
            ]);

            // Guardar relación de múltiples entrenadores
            if (!empty($trainers)) {
                $pago->entrenadores()->sync($trainers);
            }

            $createdEvents[] = $pago;
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Clase creada exitosamente'
            ]);
        }

        return redirect()->route('Pagos')->with('success', 'Clase creada exitosamente.');
    }

    // Método para añadir entrenador a una sesión completa
    public function addTrainerToSession(Request $request) 
    {
        $request->validate([
            'trainer_id' => 'required|exists:users,id',
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        $fecha = Carbon::parse($request->fecha_hora);
        
        // Buscar todos los pagos que coinciden con la "sesión"
        $pagos = Pago::where('fecha_registro', $fecha)
                     ->where('nombre_clase', $request->nombre_clase)
                     ->where('centro', $request->centro)
                     ->get();

        if ($pagos->isEmpty()) {
            return response()->json(['error' => 'Sesión no encontrada'], 404);
        }

        foreach($pagos as $pago) {
            // Attach si no existe ya
            if (!$pago->entrenadores()->where('user_id', $request->trainer_id)->exists()) {
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
            'trainer_id' => 'required|exists:users,id',
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        $fecha = Carbon::parse($request->fecha_hora);
        
        $pagos = Pago::where('fecha_registro', $fecha)
                     ->where('nombre_clase', $request->nombre_clase)
                     ->where('centro', $request->centro)
                     ->get();

        if ($pagos->isEmpty()) {
            return response()->json(['error' => 'Sesión no encontrada'], 404);
        }

        foreach($pagos as $pago) {
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

    private function _getTrainersForSession($pagos) {
        $entrenadores = collect();
        // Recargar las relaciones para tener datos frescos
        $pagos->each->load('entrenadores');
        
        $pagos->each(function($p) use ($entrenadores) {
            foreach($p->entrenadores as $t) {
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
            'id' => 'required|integer',
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);

        $start = Carbon::parse($request->start)->startOfDay();
        $end = Carbon::parse($request->end)->endOfDay();
        $type = $request->type;
        $id = $request->id;

        $query = Pago::with(['user', 'entrenadores'])
                     ->whereBetween('fecha_registro', [$start, $end]);

        if ($type === 'user') {
            $query->where('user_id', $id);
            $persona = User::find($id);
        } else {
            // Entrenador: Buscar en la relación muchos a muchos
            $query->whereHas('entrenadores', function($q) use ($id) {
                $q->where('users.id', $id);
            });
            $persona = User::find($id);
        }

        $pagos = $query->orderBy('fecha_registro', 'asc')->get();

        // Calcular totales
        $totalSesiones = $pagos->count(); 
        $totalImporte = $pagos->sum('importe');

        // Formatear para la tabla
        $detalles = $pagos->map(function($p) {
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
}