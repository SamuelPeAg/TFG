<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use App\Models\Entrenador;
use App\Models\Centro;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;

class FacturacionController extends Controller
{
    public function index(Request $request)
    {
        $desde = $request->query('desde', '');
        $hasta = $request->query('hasta', '');
        $centro = $request->query('centro', 'todos');
        $entrenadorId = $request->query('entrenador_id', '');
        $clienteId = $request->query('cliente_id', '');
        $anio = $request->query('anio', date('Y'));
        $mes = $request->query('mes', '');

        if ($mes && $anio) {
            $desde = $anio . '-' . $mes . '-01';
            $hasta = date('Y-m-t', strtotime($desde));
        } elseif ($anio && !$mes) {
            $desde = $anio . '-01-01';
            $hasta = $anio . '-12-31';
        }

        $q = Pago::query()
            ->with(['entrenador:id,name', 'entrenadores:id,name'])
            ->when($desde, fn($qq) => $qq->whereDate('fecha_registro', '>=', $desde))
            ->when($hasta, fn($qq) => $qq->whereDate('fecha_registro', '<=', $hasta))
            ->when($centro !== 'todos', fn($qq) => $qq->where('centro', $centro))
            ->when($entrenadorId, function($qq) use ($entrenadorId) {
                $qq->where(function($sub) use ($entrenadorId) {
                    $sub->where('entrenador_id', $entrenadorId)
                        ->orWhereHas('entrenadores', fn($h) => $h->where('entrenadores.id', $entrenadorId));
                });
            });

        $Pagos = $q->get();

        $resumen = [];
        foreach ($Pagos as $pago) {
            $trainerIds = [];
            $trainerNames = [];
            
            if ($pago->entrenador_id) {
                $trainerIds[] = $pago->entrenador_id;
                $trainerNames[$pago->entrenador_id] = $pago->entrenador->name ?? 'Sin nombre';
            }
            
            foreach ($pago->entrenadores as $t) {
                if (!in_array($t->id, $trainerIds)) {
                    $trainerIds[] = $t->id;
                    $trainerNames[$t->id] = $t->name;
                }
            }

            if (empty($trainerIds)) {
                $trainerIds[] = 0;
                $trainerNames[0] = 'Sin entrenador';
            }

            foreach ($trainerIds as $tid) {
                $nombre = $trainerNames[$tid];
                if (!isset($resumen[$nombre])) {
                    $resumen[$nombre] = [
                        'Pagos' => 0,
                        'facturacion' => 0,
                    ];
                }
                $resumen[$nombre]['Pagos'] += 1;
                $resumen[$nombre]['facturacion'] += (float) ($pago->importe ?? 0);
            }
        }

        foreach ($resumen as $k => $v) {
            $resumen[$k]['facturacion'] = round($v['facturacion'], 2);
        }

        $centros = Centro::all();

        // Obtener entrenadores del nuevo modelo
        $entrenadores = Entrenador::role('entrenador')
            ->orderBy('name')
            ->get(['id', 'name']);

        // Clientes del modelo User
        $clientes = User::orderBy('name')
            ->get(['id', 'name', 'email']);

        if ($entrenadorId) {
            $entrenadores = $entrenadores->where('id', (int) $entrenadorId)->values();
        }

        if ($clienteId) {
            $clientes = $clientes->where('id', (int) $clienteId)->values();
        }

        if (Schema::hasColumn('horarios_clases', 'entrenador_id')) {
            $entCol = 'horarios_clases.entrenador_id';
        } elseif (Schema::hasColumn('horarios_clases', 'id_entrenador')) {
            $entCol = 'horarios_clases.id_entrenador';
        } else {
            return view('facturacion.facturas', [
                'centros' => $centros,
                'entrenadores' => $entrenadores,
                'clientes' => $clientes,
                'matrix' => [],
                'resumen' => $resumen,
                'desde' => $desde,
                'hasta' => $hasta,
                'centro' => $centro,
                'entrenadorId' => $entrenadorId,
                'clienteId' => $clienteId,
            ]);
        }

        if (Schema::hasColumn('horarios_clases', 'centro_id')) {
            $centroCol = 'horarios_clases.centro_id';
        } elseif (Schema::hasColumn('horarios_clases', 'id_centro')) {
            $centroCol = 'horarios_clases.id_centro';
        } elseif (Schema::hasColumn('horarios_clases', 'centro')) {
            $centroCol = 'horarios_clases.centro';
        } else {
            $centroCol = null;
        }

        $reservasQ = \App\Models\Reserva::query()
            ->selectRaw("reservas.id_usuario as cliente_id, {$entCol} as entrenador_id, count(*) as total")
            ->join('horarios_clases', 'reservas.id_horario_clase', '=', 'horarios_clases.id')
            ->groupByRaw("reservas.id_usuario, {$entCol}")
            ->when($desde, fn($q) => $q->whereDate('horarios_clases.fecha_hora_inicio', '>=', $desde))
            ->when($hasta, fn($q) => $q->whereDate('horarios_clases.fecha_hora_inicio', '<=', $hasta))
            ->when($centro !== 'todos' && $centroCol, fn($q) => $q->where($centroCol, $centro))
            ->when($entrenadorId, fn($q) => $q->whereRaw("{$entCol} = ?", [$entrenadorId]))
            ->when($clienteId, fn($q) => $q->where('reservas.id_usuario', $clienteId));

        $reservasGrouped = $reservasQ->get();

        $matrix = [];

        $pagosQuery = Pago::with('entrenadores')->select('id', 'user_id', 'entrenador_id', 'fecha_registro', 'centro');
        if ($desde) $pagosQuery->whereDate('fecha_registro', '>=', $desde);
        if ($hasta) $pagosQuery->whereDate('fecha_registro', '<=', $hasta);
        if ($clienteId) $pagosQuery->where('user_id', $clienteId);
        
        if ($entrenadorId) {
            $pagosQuery->where(function($q) use ($entrenadorId) {
                $q->where('entrenador_id', $entrenadorId)
                  ->orWhereHas('entrenadores', fn($qq) => $qq->where('entrenadores.id', $entrenadorId));
            });
        }
        if ($centro !== 'todos') $pagosQuery->where('centro', $centro);

        $pagosAll = $pagosQuery->get();

        foreach ($pagosAll as $pago) {
            $cliente = $pago->user_id;
            $trainerIds = [];
            if ($pago->entrenador_id) $trainerIds[] = $pago->entrenador_id;
            if ($pago->entrenadores && $pago->entrenadores->count()) {
                foreach ($pago->entrenadores as $t) {
                    $trainerIds[] = $t->id;
                }
            }
            $trainerIds = array_values(array_unique($trainerIds));
            foreach ($trainerIds as $tid) {
                $matrix[$cliente][$tid] = ($matrix[$cliente][$tid] ?? 0) + 1;
            }
        }

        foreach ($reservasGrouped as $r) {
            $c = $r->cliente_id;
            $t = $r->entrenador_id;
            if (!isset($matrix[$c][$t]) || $matrix[$c][$t] == 0) {
                $matrix[$c][$t] = (int) $r->total;
            }
        }

        $clienteTotals = [];
        foreach ($clientes as $c) {
            $totalClases = 0;
            if (isset($matrix[$c->id])) {
                $totalClases = array_sum($matrix[$c->id]);
            }
            $totalCoste = $Pagos->where('user_id', $c->id)->sum('importe');
            $clienteTotals[$c->id] = [
                'total_clases' => $totalClases,
                'total_coste' => round($totalCoste, 2)
            ];
        }

        $clientesConDatos = array_keys($matrix);
        $clientes = $clientes->whereIn('id', $clientesConDatos)->values();

        $entrenadoresIds = [];
        foreach ($matrix as $clienteData) {
            $entrenadoresIds = array_merge($entrenadoresIds, array_keys($clienteData));
        }
        $entrenadoresIds = array_unique($entrenadoresIds);
        $entrenadores = $entrenadores->whereIn('id', $entrenadoresIds)->values();

        $clienteTotals = array_filter($clienteTotals, fn($key) => in_array($key, $clientesConDatos), ARRAY_FILTER_USE_KEY);

        $todosLosClientes = User::role('cliente')->orderBy('name')->get(['id', 'name', 'email']);

        return view('facturacion.facturas', [
            'centros' => $centros,
            'entrenadores' => $entrenadores,
            'clientes' => $clientes,
            'todosLosClientes' => $todosLosClientes,
            'matrix' => $matrix,
            'resumen' => $resumen,
            'clienteTotals' => $clienteTotals,
            'desde' => $desde,
            'hasta' => $hasta,
            'centro' => $centro,
            'entrenadorId' => $entrenadorId,
            'clienteId' => $clienteId,
            'anio' => $anio,
            'mes' => $mes,
        ]);
    }

    public function clases(Request $request)
    {
        $clienteId = $request->query('cliente_id');
        $entrenadorId = $request->query('entrenador_id');
        $centro = $request->query('centro', 'todos');

        $horarioEntCol = Schema::hasColumn('horarios_clases', 'entrenador_id') ? 'horarios_clases.entrenador_id' : (Schema::hasColumn('horarios_clases', 'id_entrenador') ? 'horarios_clases.id_entrenador' : null);
        if (Schema::hasColumn('horarios_clases', 'centro_id')) {
            $horarioCentroCol = 'horarios_clases.centro_id';
        } elseif (Schema::hasColumn('horarios_clases', 'id_centro')) {
            $horarioCentroCol = 'horarios_clases.id_centro';
        } elseif (Schema::hasColumn('horarios_clases', 'centro')) {
            $horarioCentroCol = 'horarios_clases.centro';
        } else {
            $horarioCentroCol = null;
        }

        $q = \App\Models\Reserva::query()
            ->select('reservas.id as reserva_id', 'reservas.id_usuario', 'horarios_clases.id as horario_id', 'horarios_clases.fecha_hora_inicio')
            ->join('horarios_clases', 'reservas.id_horario_clase', '=', 'horarios_clases.id');

        if ($clienteId) $q->where('reservas.id_usuario', $clienteId);
        if ($entrenadorId && $horarioEntCol) $q->whereRaw("{$horarioEntCol} = ?", [$entrenadorId]);
        if ($centro !== 'todos' && $horarioCentroCol) $q->where($horarioCentroCol, $centro);

        $items = $q->with(['usuario:id,name', 'horarioClase:id,fecha_hora_inicio,entrenador_id'])->get();

        $result = collect();

        foreach ($items as $it) {
            $cliente = $it->usuario?->name ?? null;
            $fecha = $it->horarioClase?->fecha_hora_inicio?->toDateTimeString() ?? null;
            $entrenadorIdRow = $it->horarioClase?->entrenador_id ?? null;
            $entrenador = $entrenadorIdRow ? (Entrenador::find($entrenadorIdRow)?->name) : null;

            $pago = Pago::where('user_id', $it->id_usuario)
                ->when($entrenadorIdRow, fn($q) => $q->where('entrenador_id', $entrenadorIdRow))
                ->whereDate('fecha_registro', optional($it->horarioClase->fecha_hora_inicio)->toDateString())
                ->first();
            
            $result->push([
                'source' => 'reserva',
                'reserva_id' => $it->reserva_id,
                'cliente' => $cliente,
                'entrenador' => $entrenador,
                'fecha' => $fecha,
                'importe' => $pago?->importe,
                'metodo' => $pago?->metodo_pago,
                'nombre_clase' => $pago?->nombre_clase,
                'centro' => optional($it->horarioClase->centro)->nombre ?? null,
            ]);
        }

        $pagoQuery = Pago::with(['user', 'entrenadores']);
        if ($clienteId) $pagoQuery->where('user_id', $clienteId);
        if ($entrenadorId) {
            $pagoQuery->where(function($q) use ($entrenadorId) {
                $q->where('entrenador_id', $entrenadorId)
                  ->orWhereHas('entrenadores', fn($qq) => $qq->where('entrenadores.id', $entrenadorId));
            });
        }

        $pagos = $pagoQuery->get();

        foreach ($pagos as $p) {
            $trainerName = null;
            if ($p->entrenador_id) {
                $trainerName = Entrenador::find($p->entrenador_id)?->name;
            } elseif ($p->entrenadores && $p->entrenadores->count()) {
                $trainerName = $p->entrenadores->first()->name;
            }

            $result->push([
                'source' => 'pago',
                'pago_id' => $p->id,
                'cliente' => $p->user?->name ?? null,
                'entrenador' => $trainerName,
                'fecha' => $p->fecha_registro?->toDateTimeString() ?? null,
                'importe' => $p->importe,
                'metodo' => $p->metodo_pago ?? null,
                'nombre_clase' => $p->nombre_clase ?? null,
                'centro' => $p->centro ? (Centro::find($p->centro)->nombre ?? $p->centro) : null,
            ]);
        }

        return response()->json($result->values());
    }
}
