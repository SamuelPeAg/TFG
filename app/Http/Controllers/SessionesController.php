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
        // Verifica que tu archivo blade esté en resources/views/sessions/sesiones.blade.php
        return view('sessions.sesiones');
    }

    /**
     * Busca sesiones por nombre de usuario (AJAX).
     */
    public function buscarPorUsuario(Request $request)
    {
        $nombre = $request->input('q');

        // Si el buscador está vacío, no devolvemos nada
        if(!$nombre) return response()->json([]);

        // 1. Buscamos en la base de datos
        $sesiones = Sessiones::with('user') 
            ->whereHas('user', function($query) use ($nombre) {
                $query->where('name', 'LIKE', "%{$nombre}%");
            })
            ->get();

        // 2. Agrupamos los resultados por fecha para el calendario
        $datosParaCalendario = $sesiones->mapToGroups(function ($sesion) {
            
            // Aseguramos que Fecharegistro sea una fecha válida
            $fecha = Carbon::parse($sesion->Fecharegistro);
            
            return [
                // La fecha es la clave (YYYY-MM-DD)
                $fecha->format('Y-m-d') => [
                    'centro'     => 'Factomove Center', 
                    'clase'      => 'Entrenamiento',
                    'entrenador' => 'Staff', // Puedes cambiar esto si tienes el dato real
                    'hora'       => $fecha->format('H:i'), 
                    'precio'     => number_format($sesion->Pago, 2) . '€',
                ]
            ];
        });

        // 3. Devolvemos el JSON limpio
        return response()->json($datosParaCalendario);
    }
}