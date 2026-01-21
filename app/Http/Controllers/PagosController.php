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

        if ($nombre === '') {
            return response()->json(['events' => []]);
        }

        $pagos = Pago::with('user')
            ->whereHas('user', function ($query) use ($nombre) {
                $query->where('name', 'like', "%{$nombre}%");
            })
            ->orderBy('fecha_registro', 'asc')
            ->get();

        $events = $pagos->map(function (Pago $p) {
            $fechaRegistro = $p->getAttribute('fecha_registro');
            $fecha = $fechaRegistro ? Carbon::parse($fechaRegistro) : null;

            return [
                'fecha' => $fecha?->format('Y-m-d') ?? '',
                'hora'  => $fecha?->format('H:i') ?? '',
                'clase' => (string) $p->getAttribute('nombre_clase'),
                'descripcion' => '',
                'coste' => (float) $p->getAttribute('importe'),
                'pago' => (string) $p->getAttribute('metodo_pago'),
                'centro' => (string) $p->getAttribute('centro'),
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
        ]);

        $user = User::findOrFail($data['user_id']);

        Pago::create([
            'user_id'        => $user->getAttribute('id'),
            'entrenador_id'  => auth()->id(),
            'iban'           => $user->getAttribute('iban'),
            'importe'        => $data['precio'],
            'fecha_registro' => Carbon::parse($data['fecha_hora']),
            'centro'         => $data['centro'],
            'nombre_clase'   => $data['nombre_clase'],
            'metodo_pago'    => $data['metodo_pago'],
        ]);

        return redirect()->route('Pagos')->with('success', 'Pago creado correctamente.');
    }
}
