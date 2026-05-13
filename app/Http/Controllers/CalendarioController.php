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

    public function userCredits(Request $request)
    {
        $user = auth()->user();
        if (!$user) return response()->json(['success' => false], 401);

        $saldos = [];
        foreach($user->suscripciones()->where('estado', 'activo')->get() as $su) {
             foreach($su->saldos_por_tipo as $item) {
                 $tipoId = $item['tipo_credito']->id;
                 if (!isset($saldos[$tipoId])) {
                     $saldos[$tipoId] = [
                         'nombre' => $item['tipo_credito']->nombre,
                         'total' => 0
                     ];
                 }
                 $saldos[$tipoId]['total'] += $item['total'];
             }
        }

        return response()->json([
            'success' => true,
            'credits' => array_values($saldos)
        ]);
    }
}
