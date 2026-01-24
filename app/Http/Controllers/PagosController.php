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
        $users = User::orderBy('name')->get();
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

        $events = $pagos->map(function (Pago $p) {
            $fecha = $p->fecha_registro;
            return [
                'id' => $p->id,
                'title' => $p->nombre_clase . ' - ' . ($p->user->name ?? 'Usuario'),
                'start' => $fecha ? $fecha->toIso8601String() : null,
                'backgroundColor' => '#00897b',
                'borderColor' => '#00897b',
                'textColor' => '#ffffff',
                'extendedProps' => [
                    'hora' => $fecha ? $fecha->format('H:i') : '',
                    'coste' => (float) $p->importe,
                    'pago' => (string) $p->metodo_pago,
                    'centro' => $p->centro,
                    'alumno' => $p->user->name ?? 'Desconocido',
                    'clase_nombre' => $p->nombre_clase
                ],
            ];
        })->values();

        return response()->json(['events' => $events]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'      => ['required', 'exists:users,id'],
            'centro'       => ['required', 'in:CLINICA,AIRA,OPEN'],
            'nombre_clase' => ['required', 'string', 'max:120'],
            'metodo_pago'  => ['required', 'in:TPV,EF,DD,CC'],
            'fecha_hora'   => ['required', 'date'],
            'precio'       => ['required', 'numeric', 'min:0'],
        ], [
            'user_id.required' => 'El usuario es obligatorio.',
            'user_id.exists' => 'El usuario seleccionado no es válido.',
            'centro.required' => 'El centro es obligatorio.',
            'centro.in' => 'El centro seleccionado no es válido.',
            'nombre_clase.required' => 'El nombre de la clase es obligatorio.',
            'nombre_clase.max' => 'El nombre de la clase no puede superar los 120 caracteres.',
            'metodo_pago.required' => 'El método de pago es obligatorio.',
            'metodo_pago.in' => 'El método de pago seleccionado no es válido.',
            'fecha_hora.required' => 'La fecha y hora son obligatorias.',
            'fecha_hora.date' => 'La fecha no es válida.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio no puede ser negativo.',
        ]);

        $user = User::findOrFail($data['user_id']);
        $fecha = Carbon::parse($data['fecha_hora']);

        $pago = Pago::create([
            'user_id'        => $user->id,
            // 'entrenador_id'  => $request->user()->id,
            'iban'           => $user->iban,
            'importe'        => $data['precio'],
            'fecha_registro' => $fecha,
            'centro'         => $data['centro'],
            'nombre_clase'   => $data['nombre_clase'],
            'metodo_pago'    => $data['metodo_pago'],
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'event' => [
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
                ]
            ]);
        }

        return redirect()->route('Pagos')->with('success', 'Clase creada.');
    }
}