<?php

namespace App\Http\Controllers;

use App\Models\Sessiones;
use App\Models\User;
use Illuminate\Http\Request;

class FacturacionController extends Controller
{
    public function index(Request $request)
    {
        $desde = $request->query('desde', '');
        $hasta = $request->query('hasta', '');
        $centro = $request->query('centro', 'todos');
        $entrenadorId = $request->query('entrenador_id', '');

        $q = Sessiones::query()
            ->with(['entrenador:id,name'])
            ->when($desde, fn($qq) => $qq->whereDate('Fecharegistro', '>=', $desde))
            ->when($hasta, fn($qq) => $qq->whereDate('Fecharegistro', '<=', $hasta))
            ->when($centro !== 'todos', fn($qq) => $qq->where('centro', $centro))
            ->when($entrenadorId, fn($qq) => $qq->where('entrenador_id', $entrenadorId));

        $sesiones = $q->get();

        $centros = Sessiones::query()
            ->select('centro')
            ->distinct()
            ->orderBy('centro')
            ->pluck('centro')
            ->values();

        $entrenadores = User::role('entrenador')
            ->orderBy('name')
            ->get(['id', 'name']);

        $resumen = [];

        foreach ($sesiones as $s) {
            $nombre = $s->entrenador?->name ?? 'Sin entrenador';

            if (!isset($resumen[$nombre])) {
                $resumen[$nombre] = [
                    'sesiones' => 0,
                    'facturacion' => 0,
                ];
            }

            $resumen[$nombre]['sesiones'] += 1;
            $resumen[$nombre]['facturacion'] += (float) ($s->Pago ?? 0);
        }

        foreach ($resumen as $k => $v) {
            $resumen[$k]['facturacion'] = round($v['facturacion'], 2);
        }

        return view('facturacion.facturas', [
            'centros' => $centros,
            'entrenadores' => $entrenadores,
            'resumen' => $resumen,
            'desde' => $desde,
            'hasta' => $hasta,
            'centro' => $centro,
            'entrenadorId' => $entrenadorId,
        ]);
    }
}
