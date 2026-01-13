<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth; // Necesario para auth()->id()

class UserReservationController extends Controller
{
    /**
     * Muestra la vista del calendario filtrada por centro.
     */
    public function index(Request $request)
    {
        // 1. Recogemos el centro que viene de la URL (AIRA, OPEN o VIRTUAL)
        $center = $request->query('center');

        // 2. Retornamos la vista del calendario pasando la variable center
        return view('booking.calendar', compact('center'));
    }

    /**
     * Guarda la reserva cuando el usuario confirma en el modal.
     * Esta es la función que te faltaba para la ruta 'sesiones.reservar'.
     */
    public function store(Request $request)
    {
        // 1. Validación básica: asegurarnos de que llega un ID de clase
        $request->validate([
            'class_id' => 'required|integer',
        ]);

        // 2. Crear la reserva
        // Asumimos que tu tabla 'reservas' tiene 'id_usuario' y 'id_horario_clase' 
        // basándonos en tu función search().
        $reserva = new Reserva();
        $reserva->id_usuario = Auth::id(); // Usuario logueado
        $reserva->id_horario_clase = $request->class_id; // El ID que viene del modal
        $reserva->fecha_reserva = now(); // Fecha actual
        $reserva->estado = 'confirmada'; // O 'pendiente', según tu lógica
        $reserva->save();

        // 3. Volver atrás con mensaje de éxito
        return back()->with('success', '¡Tu clase ha sido reservada correctamente!');
    }

    /**
     * Busca reservas de usuario por nombre o email y devuelve JSON (Para el buscador del admin).
     */
    public function search(Request $request)
    {
        $q = $request->query('q', '');
        
        if (empty($q)) {
            return response()->json(['success' => true, 'events' => []]);
        }

        $user = User::where('name', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->first();

        if (!$user) {
            return response()->json(['success' => true, 'events' => []]);
        }

        $reservas = Reserva::where('id_usuario', $user->id)
            ->with('horarioClase.clase')
            ->get();

        $events = [];
        foreach ($reservas as $r) {
            $hc = $r->horarioClase;
            if (!$hc) continue;

            $cl = $hc->clase;
            $dt = Carbon::parse($hc->fecha_hora_inicio);

            $events[] = [
                'fecha' => $dt->format('Y-m-d'),
                'hora' => $dt->format('H:i'),
                'clase' => $cl ? $cl->nombre : null,
                'descripcion' => $cl ? $cl->descripcion : null,
                'coste' => null,
                'pago' => null,
                'estado' => $r->estado,
            ];
        }

        return response()->json([
            'success' => true,
            'user' => ['id' => $user->id, 'name' => $user->name],
            'events' => $events,
        ]);
    }
}