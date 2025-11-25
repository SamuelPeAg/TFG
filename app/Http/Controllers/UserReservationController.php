<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Reserva;
use Carbon\Carbon;

class UserReservationController extends Controller
{
    /**
     * Search user reservations by name or email and return JSON events.
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
