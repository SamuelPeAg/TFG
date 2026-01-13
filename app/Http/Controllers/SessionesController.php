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


    public function store(Request $request)
    {
        // 1) Validación (ajusta centros/métodos a tus opciones reales)
        $data = $request->validate([
            'user_id'       => ['required', 'exists:users,id'],
            'centro'        => ['required', 'in:CLINICA,AIRA,OPEN'],
            'nombre_clase'  => ['required', 'string', 'max:120'],
            'metodo_pago' => ['required', 'in:TPV,EF,DD,CC'],
            'fecha_hora'    => ['required', 'date'],           // viene del input datetime-local
            'precio'        => ['required', 'numeric', 'min:0'],// tu "Pago"
        ]);

        // 2) Sacar IBAN del usuario (recomendado) o dejarlo null si no lo usas
        $user = User::findOrFail($data['user_id']);

        // Si en tu tabla users tienes columna IBAN:
        // $iban = $user->IBAN;
        // Si NO tienes IBAN en users, puedes dejarlo null o cogerlo del request si lo tienes en el form.
        $iban = $user->IBAN ?? null;

        // 3) Guardar en BD
        Sessiones::create([
            'user_id'       => $data['user_id'],
            'IBAN'          => $iban,
            'Pago'          => $data['precio'],
            'Fecharegistro' => Carbon::parse($data['fecha_hora']), // datetime
            'centro'        => $data['centro'],
            'nombre_clase'  => $data['nombre_clase'],
            'metodo_pago'   => $data['metodo_pago'],
        ]);

        // 4) Volver a la vista con mensaje
        return redirect()
            ->route('sesiones')
            ->with('success', 'Sesión creada correctamente.');
    }



}