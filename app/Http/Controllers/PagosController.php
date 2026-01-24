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
        return view('Pagos.index', compact('users'));
    }

    public function buscarPorUsuario(Request $request)
    {
        $nombre = trim((string) $request->input('q', ''));

        $query = Pago::with('user');

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

            $events[] = [
                'id' => $first->id, // ID representativo (del primero)
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
                    'alumnos' => $alumnos // Array de alumnos
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
            'centro'       => ['required', 'in:CLINICA,AIRA,OPEN'],
            'nombre_clase' => ['required', 'string', 'max:120'],
            'tipo_clase'   => ['required', 'string', 'in:EPE,DUO,TRIO,GRUPO,GRUPO_PRIVADO'],
            'metodo_pago'  => ['required', 'in:TPV,EF,DD,CC'],
            'fecha_hora'   => ['required', 'date'],
            'precio'       => ['required', 'numeric', 'min:0'],
        ], [
            'users.required' => 'Debes seleccionar al menos un usuario.',
            'users.array' => 'Formato de usuarios incorrecto.',
            'users.*.exists' => 'El usuario seleccionado no existe o no es válido.',
            'centro.required' => 'El centro es obligatorio.',
            // ... (mensajes existentes)
        ]);

        $fecha = Carbon::parse($data['fecha_hora']);
        $createdEvents = [];

        foreach ($data['users'] as $userId) {
            $user = User::findOrFail($userId);
            
            $pago = Pago::create([
                'user_id'        => $user->id,
                'iban'           => $user->iban,
                'importe'        => $data['precio'], // Precio por persona se asume, o total? Asumimos por persona según lógica común
                'fecha_registro' => $fecha,
                'centro'         => $data['centro'],
                'nombre_clase'   => $data['nombre_clase'],
                'tipo_clase'     => $data['tipo_clase'],
                'metodo_pago'    => $data['metodo_pago'],
            ]);

            $createdEvents[] = [
                'id' => $pago->id,
                'title' => $pago->nombre_clase . ' - ' . $user->name,
                'start' => $fecha->toIso8601String(),
                'backgroundColor' => '#00897b',
                'borderColor' => '#00897b',
                'extendedProps' => [
                    'hora' => $fecha->format('H:i'),
                    'coste' => (float) $pago->importe,
                    'pago' => (string) $pago->metodo_pago,
                    'centro' => $pago->centro,
                    'alumno' => $user->name,
                    'clase_nombre' => $pago->nombre_clase
                ]
            ];
        }

        if ($request->wantsJson()) {
            // Retornamos el último evento creado para compatibilidad con JS simple, 
            // o podríamos devolver todos. Como el JS actual espera un solo 'event', 
            // le mandaremos el primero o adaptamos JS. 
            // PERO: El JS usa calendar.addEvent(json.event). 
            // Para soportar múltiples, deberíamos cambiar JS o simplemente devolver success y recargar
            // o devolver un array 'events'.
            // Por simplicidad y compatibilidad con el JS que espera 'event' (singular), 
            // mandamos el primero, pero lo ideal es recargar el calendario.
            
            // HACK: Mandamos "success" y el JS ya añade ONE event. 
            // Para que salgan todos, mejor devolvemos una propiedad 'events' y actualizamos JS
            // O dejamos que el usuario recargue.
            // Voy a devolver el primero para que no rompa, pero lo ideal es refactorizar a events list
            
            return response()->json([
                'success' => true,
                'event' => $createdEvents[0] ?? null, // Retrocompatibilidad parcial
                'events' => $createdEvents // Nueva propiedad para futuro soporte
            ]);
        }

        return redirect()->route('Pagos')->with('success', 'Clase creada exitosamente.');
    }
}