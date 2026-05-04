<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function index(Request $request)
    {
        if ($request->wantsJson() || $request->ajax()) {
            $users = User::role('cliente', 'web')->orderBy('name')->get();
            $entrenadores = \App\Models\Entrenador::role('entrenador', 'staff')->orderBy('name')->get();
            $centros = \App\Models\Centro::all();
            $suscripciones = \App\Models\Suscripcion::with('centro')->orderBy('nombre')->get();
            $tipos_sesion = \App\Models\TipoSesion::where('activo', true)->with('tiposCredito')->orderBy('orden')->get();
            $tipos_credito = \App\Models\TipoCredito::orderBy('nombre')->get();

            return response()->json(compact('users', 'entrenadores', 'centros', 'suscripciones', 'tipos_sesion', 'tipos_credito'));
        }
        
        return view('app');
    }
}
