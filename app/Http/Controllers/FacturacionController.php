<?php

namespace App\Http\Controllers;

use App\Models\Sessiones;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FacturacionController extends Controller
{
    /**
     * GET /facturas
     * Filtros por querystring:
     *  - desde=YYYY-MM-DD
     *  - hasta=YYYY-MM-DD
     *  - centro=todos|CLINICA|AIRA|OPEN|...
     *  - entrenador_id=ID (opcional)
     */
    public function index(Request $request)
    {
        $desde = $request->query('desde');                 // '2026-01-01'
        $hasta = $request->query('hasta');                 // '2026-01-31'
        $centro = $request->query('centro', 'todos');      // 'todos' o 'CLINICA'
        $entrenadorId = $request->query('entrenador_id');  // id del entrenador (opcional)

        // Query base (incluye relaciones)
        $q = Sessiones::query()
            ->with([
                'user:id,name',
                'entrenador:id,name',
            ])
            ->when($desde, fn($qq) => $qq->whereDate('Fecharegistro', '>=', $desde))
            ->when($hasta, fn($qq) => $qq->whereDate('Fecharegistro', '<=', $hasta))
            ->when($centro && $centro !== 'todos', fn($qq) => $qq->where('centro', $centro))
            ->when($entrenadorId, fn($qq) => $qq->where('entrenador_id', $entrenadorId));

        // Si quieres que un entrenador vea SOLO sus sesiones (y el admin vea todo)

        $sesiones = $q->get();

        // Centros para el selector (reales desde BD)
        $centros = Sessiones::query()
            ->select('centro')
            ->distinct()
            ->orderBy('centro')
            ->pluck('centro')
            ->values();

        // Entrenadores para el selector (reales desde BD)
        $entrenadores = User::role('entrenador')
            ->orderBy('name')
            ->get(['id', 'name']);

 
        $centrosData = $sesiones
            ->groupBy('centro')
            ->map(function ($items, $nombreCentro) {

                // Agrupamos por cliente (user_id)
                $clientes = $items
                    ->groupBy(fn($s) => $s->user_id ?? 0)
                    ->map(function ($sesionesCliente) use ($nombreCentro) {

                        $first = $sesionesCliente->first();

                        // días del mes en los que hay sesiones (1..31)
                        $dias = $sesionesCliente
                            ->map(fn($s) => Carbon::parse($s->Fecharegistro)->day)
                            ->unique()
                            ->sort()
                            ->values()
                            ->all();

                        $sesionesMes = $sesionesCliente->count();
                        $precioTotal = (float) $sesionesCliente->sum('Pago');
                        $precioSesion = $sesionesMes > 0 ? round($precioTotal / $sesionesMes, 2) : 0;

                        return [
                            'nombre'        => $first->user?->name ?? 'Sin usuario',
                            'entrenador'    => $first->entrenador?->name ?? 'Sin entrenador',
                            'tipo_cobro'    => $first->metodo_pago ?? null,
                            'precio_sesion' => $precioSesion,
                            'sesiones_mes'  => $sesionesMes,
                            'sesiones_dias' => $dias,
                            'precio_total'  => round($precioTotal, 2),
                            'centro'        => $nombreCentro,
                        ];
                    })
                    ->values()
                    ->all();

                return [
                    'nombre' => $nombreCentro,
                    'clientes' => $clientes
                ];
            })
            ->values()
            ->all();

        /**
         * rankingYsesionesData (formato para tu JS):
         * {
         *   "Carlos": { facturacion: 180.00, sesiones: 7 },
         *   "Ana": { facturacion: 95.00, sesiones: 3 }
         * }
         */
        $rankingYsesionesData = [];
        foreach ($sesiones as $s) {
            $nombreEntrenador = $s->entrenador?->name ?? 'Sin entrenador';
            if (!isset($rankingYsesionesData[$nombreEntrenador])) {
                $rankingYsesionesData[$nombreEntrenador] = ['facturacion' => 0, 'sesiones' => 0];
            }
            $rankingYsesionesData[$nombreEntrenador]['facturacion'] += (float) ($s->Pago ?? 0);
            $rankingYsesionesData[$nombreEntrenador]['sesiones'] += 1;
        }
        foreach ($rankingYsesionesData as $k => $v) {
            $rankingYsesionesData[$k]['facturacion'] = round($v['facturacion'], 2);
        }

        return view('facturacion.facturas', [
            'centros' => $centros,
            'entrenadores' => $entrenadores,
            'centrosData' => $centrosData,
            'rankingYsesionesData' => $rankingYsesionesData,
            'filtros' => [
                'desde' => $desde,
                'hasta' => $hasta,
                'centro' => $centro,
                'entrenador_id' => $entrenadorId,
            ],
        ]);
    }

    // El resto del resource no lo necesitas ahora mismo
}
