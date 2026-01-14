<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sessiones;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

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

        if (!$nombre) {
            return response()->json(['events' => []]);
        }

        $sesiones = Sessiones::with('user')
            ->whereHas('user', function ($query) use ($nombre) {
                $query->where('name', 'LIKE', "%{$nombre}%");
            })
            ->orderBy('Fecharegistro', 'asc')
            ->get();

        $events = $sesiones->map(function ($sesion) {
            $fecha = Carbon::parse($sesion->Fecharegistro);

            return [
                'fecha' => $fecha->format('Y-m-d'),
                'hora'  => $fecha->format('H:i'),
                'clase' => $sesion->nombre_clase,
                'descripcion' => '',
                'coste' => $sesion->Pago,
                'pago' => $sesion->metodo_pago,
                'centro' => $sesion->centro,
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
    $iban = $user->IBAN ?? null;

    Sessiones::create([
        'user_id'       => $data['user_id'],
        'entrenador_id' => auth()->id(),
        'IBAN'          => $iban,
        'Pago'          => $data['precio'],
        'Fecharegistro' => Carbon::parse($data['fecha_hora']),
        'centro'        => $data['centro'],
        'nombre_clase'  => $data['nombre_clase'],
        'metodo_pago'   => $data['metodo_pago'],
    ]);

    return redirect()->route('sesiones')->with('success', 'Sesión creada correctamente.');
}



}