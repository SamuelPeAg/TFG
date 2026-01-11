<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sessiones;
use App\Models\User;
use Carbon\Carbon;

class SessionesController extends Controller
{
    /**
     * Muestra la vista principal.
     */
    public function index()
    {
         $users = User::orderBy('name')->get(); // o select('id','name')
        return view('sessions.sesiones', compact('users'));
    }

    /**
     * Busca sesiones por nombre de usuario (AJAX).
     */
    public function buscarPorUsuario(Request $request)
    {
    $nombre = $request->input('q');

        // Si el buscador está vacío
        if (!$nombre) {
            return response()->json(['events' => []]);
        }

        $sesiones = Sessiones::with('user')
            ->whereHas('user', function ($query) use ($nombre) {
                $query->where('name', 'LIKE', "%{$nombre}%");
            })
            ->get();

        // Formato que tu JS necesita: [{ fecha, hora, clase, descripcion, coste, pago, centro }]
        $events = $sesiones->map(function ($sesion) {
            $fecha = Carbon::parse($sesion->Fecharegistro);

            return [
                'fecha' => $fecha->format('Y-m-d'),
                'hora'  => $fecha->format('H:i'),

                // Ajusta estos campos si existen en tu tabla:
                'clase' => $sesion->clase ?? 'Entrenamiento',
                'descripcion' => $sesion->descripcion ?? '',
                'coste' => $sesion->Pago ?? null,

                // si tienes método de pago en la tabla, cambia 'metodo_pago' por el nombre real
                'pago' => $sesion->metodo_pago ?? null,

                // si tienes centro en la tabla, cambia 'centro' por el nombre real
                'centro' => $sesion->centro ?? null,
            ];
        })->values();

        return response()->json(['events' => $events]);
    }
}