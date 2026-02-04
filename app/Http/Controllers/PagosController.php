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
        $centros = \App\Models\Centro::all();
        return view('Pagos.index', compact('users', 'entrenadores', 'centros'));
    }

    public function buscarPorUsuario(Request $request)
    {
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
                // Usamos propiedades personalizadas para identificar la sesión única y poder editar todos
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
        $request->validate([
            'centro' => ['required', 'string'],
            'nombre_clase' => ['required', 'string', 'max:120'],
            'tipo_clase' => ['required', 'string', 'in:EP,DUO,TRIO,GRUPO,GRUPO_PRIVADO'],
            'fecha_hora' => ['required', 'date'],
            'trainers' => ['nullable', 'array'],
            'trainers.*' => ['exists:users,id'],
            // New structure: participants array
            'participants' => ['required', 'array', 'min:1'],
            'participants.*.user_id' => ['required', 'exists:users,id'],
            'participants.*.precio' => ['required', 'numeric', 'min:0'],
            'participants.*.metodo_pago' => ['required', 'in:TPV,EF,DD,CC'],
        ]);

        $fecha = Carbon::parse($request->input('fecha_hora'));
        $createdEvents = [];

        $trainers = $request->input('trainers', []);
        $firstTrainerId = !empty($trainers) ? $trainers[0] : null;

        foreach ($request->input('participants') as $pData) {
            $userId = $pData['user_id'];
            $user = User::findOrFail($userId);

            $pago = Pago::create([
                'user_id' => $user->id,
                'entrenador_id' => $firstTrainerId,
                'iban' => $user->iban,
                'importe' => $pData['precio'],
                'fecha_registro' => $fecha,
                'centro' => $request->input('centro'),
                'nombre_clase' => $request->input('nombre_clase'),
                'tipo_clase' => $request->input('tipo_clase'),
                'metodo_pago' => $pData['metodo_pago'],
            ]);

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
            return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
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

        // 2. Verificar que el usuario no esté ya en esa sesión
        $exists = Pago::where('fecha_registro', $fecha)
            ->where('nombre_clase', $request->nombre_clase)
            ->where('centro', $request->centro)
            ->where('user_id', $request->user_id)
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'El usuario ya está inscrito en esta clase.'], 422);
        }

        $newUser = User::find($request->user_id);

        // 3. Crear el nuevo pago
        $newPago = Pago::create([
            'user_id' => $newUser->id,
            'entrenador_id' => $existingPago->entrenador_id, // Legacy
            'iban' => $newUser->iban,
            'importe' => $existingPago->importe,
            'fecha_registro' => $fecha,
            'centro' => $existingPago->centro,
            'nombre_clase' => $existingPago->nombre_clase,
            'tipo_clase' => $existingPago->tipo_clase,
            'metodo_pago' => $existingPago->metodo_pago, // Asume mismo método por defecto, o podría pedirse
        ]);

        // 4. Copiar relaciones de entrenadores
        $trainers = $existingPago->entrenadores->pluck('id')->toArray();
        if (!empty($trainers)) {
            $newPago->entrenadores()->sync($trainers);
        }

        return response()->json(['success' => true, 'message' => 'Cliente añadido correctamente']);
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
}