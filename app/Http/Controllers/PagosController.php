<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use App\Models\Entrenador;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PagosController extends Controller
{
    /**
     * Get the authenticated user from the appropriate guard.
     */
    protected function getAuthUser()
    {
        return Auth::guard('entrenador')->user() ?: Auth::guard('web')->user();
    }

    public function index()
    {
        // El modelo User ahora solo contiene clientes
        $users = User::orderBy('name')->get();
        // El modelo Entrenador contiene entrenadores (y admins)
        $entrenadores = Entrenador::role('entrenador')->orderBy('name')->get();
        $centros = \App\Models\Centro::all();
        return view('Pagos.index', compact('users', 'entrenadores', 'centros'));
    }

    public function buscarPorUsuario(Request $request)
    {
        $nombre = trim((string) $request->input('q', ''));

        $query = Pago::with(['user', 'entrenadores']);

        if ($nombre !== '') {
            $query->where(function ($q) use ($nombre) {
                $q->whereHas('user', function ($sub) use ($nombre) {
                    $sub->where('name', 'like', "%{$nombre}%");
                })->orWhere('centro', 'like', "%{$nombre}%");
            });
        }

        $pagos = $query->orderBy('fecha_registro', 'asc')->get();

        $grouped = $pagos->groupBy(function ($p) {
            return $p->fecha_registro->format('Y-m-d H:i:s') . '|' . strtolower(trim($p->nombre_clase)) . '|' . $p->centro;
        });

        $events = [];
        foreach ($grouped as $key => $grupo) {
            $first = $grupo->first();
            $count = $grupo->count();
            
            if ($count === 1) {
                $title = $first->nombre_clase . ' - ' . ($first->user->name ?? 'Usuario');
            } else {
                $title = $first->nombre_clase . ' (' . $count . ')';
            }

            $alumnos = $grupo->map(function ($p) {
                return [
                    'id' => $p->user_id,
                    'nombre' => $p->user->name ?? 'Desconocido',
                    'pago' => $p->metodo_pago,
                    'coste' => (float) $p->importe
                ];
            })->values();

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
            $color = '#A5EFE2'; 
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
        $data = $request->validate([
            'users'        => ['required', 'array', 'min:1'],
            'users.*'      => ['exists:users,id'],
            'trainers'     => ['nullable', 'array'],
            'trainers.*'   => ['exists:entrenadores,id'], // Cambiado a entrenadores
            'centro'       => ['required', 'string'],
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
        $trainers = $data['trainers'] ?? [];
        $firstTrainerId = !empty($trainers) ? $trainers[0] : null;

        foreach ($data['users'] as $userId) {
            $user = User::findOrFail($userId);
            
            $pago = Pago::create([
                'user_id'        => $user->id,
                'entrenador_id'  => $firstTrainerId,
                'iban'           => $user->iban,
                'importe'        => $data['precio'], 
                'fecha_registro' => $fecha,
                'centro'         => $data['centro'],
                'nombre_clase'   => $data['nombre_clase'],
                'tipo_clase'     => $data['tipo_clase'],
                'metodo_pago'    => $data['metodo_pago'],
            ]);

            if (!empty($trainers)) {
                $pago->entrenadores()->sync($trainers);
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Clase creada exitosamente'
            ]);
        }

        return redirect()->route('Pagos')->with('success', 'Clase creada exitosamente.');
    }

    public function addTrainerToSession(Request $request) 
    {
        $request->validate([
            'trainer_id' => 'required|exists:entrenadores,id', // Cambiado a entrenadores
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        $authUser = $this->getAuthUser();

        if (!$authUser || !$authUser->hasRole('admin')) {
            if (!$authUser || $authUser->id != $request->trainer_id) {
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

        foreach($pagos as $pago) {
            if (!$pago->entrenadores()->where('entrenadores.id', $request->trainer_id)->exists()) {
                $pago->entrenadores()->attach($request->trainer_id);
                
                if (!$pago->entrenador_id) {
                    $pago->entrenador_id = $request->trainer_id;
                    $pago->save();
                }
            }
        }

        $updatedTrainers = $this->_getTrainersForSession($pagos);

        return response()->json([
            'success' => true,
            'trainers' => $updatedTrainers
        ]);
    }

    public function removeTrainerFromSession(Request $request) 
    {
        $request->validate([
            'trainer_id' => 'required|exists:entrenadores,id', // Cambiado a entrenadores
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        $authUser = $this->getAuthUser();

        if (!$authUser || !$authUser->hasRole('admin')) {
             if (!$authUser || $authUser->id != $request->trainer_id) {
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

        foreach($pagos as $pago) {
            $pago->entrenadores()->detach($request->trainer_id);
            
            if ($pago->entrenador_id == $request->trainer_id) {
                $next = $pago->entrenadores()->first();
                $pago->entrenador_id = $next ? $next->id : null;
                $pago->save();
            }
        }

        $updatedTrainers = $this->_getTrainersForSession($pagos);

        return response()->json([
            'success' => true,
            'trainers' => $updatedTrainers
        ]);
    }

    public function addClientToSession(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        $authUser = $this->getAuthUser();

        if (!$authUser || !$authUser->hasRole('admin')) {
             return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
        }

        $fecha = Carbon::parse($request->fecha_hora);
        
        $existingPago = Pago::where('fecha_registro', $fecha)
                     ->where('nombre_clase', $request->nombre_clase)
                     ->where('centro', $request->centro)
                     ->first();

        if (!$existingPago) {
            return response()->json(['error' => 'Sesión no encontrada o vacía'], 404);
        }

        $exists = Pago::where('fecha_registro', $fecha)
                    ->where('nombre_clase', $request->nombre_clase)
                    ->where('centro', $request->centro)
                    ->where('user_id', $request->user_id)
                    ->exists();

        if ($exists) {
            return response()->json(['error' => 'El usuario ya está inscrito en esta clase.'], 422);
        }

        $newUser = User::find($request->user_id);

        $newPago = Pago::create([
            'user_id'        => $newUser->id,
            'entrenador_id'  => $existingPago->entrenador_id,
            'iban'           => $newUser->iban,
            'importe'        => $existingPago->importe, 
            'fecha_registro' => $fecha,
            'centro'         => $existingPago->centro,
            'nombre_clase'   => $existingPago->nombre_clase,
            'tipo_clase'     => $existingPago->tipo_clase,
            'metodo_pago'    => $existingPago->metodo_pago,
        ]);

        $trainers = $existingPago->entrenadores->pluck('id')->toArray();
        if (!empty($trainers)) {
            $newPago->entrenadores()->sync($trainers);
        }

        return response()->json(['success' => true, 'message' => 'Cliente añadido correctamente']);
    }

    public function removeClientFromSession(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        $authUser = $this->getAuthUser();

        if (!$authUser || !$authUser->hasRole('admin')) {
             return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
        }

        $fecha = Carbon::parse($request->fecha_hora);

        $deleted = Pago::where('fecha_registro', $fecha)
                    ->where('nombre_clase', $request->nombre_clase)
                    ->where('centro', $request->centro)
                    ->where('user_id', $request->user_id)
                    ->delete();

        if ($deleted) {
             return response()->json(['success' => true, 'message' => 'Cliente eliminado correctamente']);
        }

        return response()->json(['error' => 'No se encontró el registro para eliminar'], 404);
    }

    private function _getTrainersForSession($pagos) {
        $entrenadores = collect();
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
            $query->whereHas('entrenadores', function($q) use ($id) {
                $q->where('entrenadores.id', $id);
            });
            $persona = Entrenador::find($id);
        }

        $pagos = $query->orderBy('fecha_registro', 'asc')->get();

        $totalSesiones = $pagos->count(); 
        $totalImporte = $pagos->sum('importe');

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

    public function deleteSession(Request $request)
    {
        $request->validate([
            'fecha_hora' => 'required|date',
            'nombre_clase' => 'required|string',
            'centro' => 'required|string'
        ]);

        $authUser = $this->getAuthUser();

        if (!$authUser || !$authUser->hasRole('admin')) {
            return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
        }

        $fecha = Carbon::parse($request->fecha_hora);

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
}