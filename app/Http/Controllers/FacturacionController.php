<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Sessiones;
use App\Models\User;
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

        // Si se especifica mes y año, calcular desde y hasta
        if ($mes && $anio) {
            $desde = $anio . '-' . $mes . '-01';
            $hasta = date('Y-m-t', strtotime($desde)); // Último día del mes
        } elseif ($anio && !$mes) {
            $desde = $anio . '-01-01';
            $hasta = $anio . '-12-31';
        }

        $q = Pago::query()
            ->with(['entrenador:id,nombre', 'entrenadores:id,nombre'])
            ->when($desde, fn($qq) => $qq->whereDate('fecha_registro', '>=', $desde))
            ->when($hasta, fn($qq) => $qq->whereDate('fecha_registro', '<=', $hasta))
            ->when($centro !== 'todos', fn($qq) => $qq->where('centro', $centro))
            ->when($entrenadorId, function ($qq) use ($entrenadorId) {
                $qq->where(function ($sub) use ($entrenadorId) {
                    $sub->where('entrenador_id', $entrenadorId)
                        ->orWhereHas('entrenadores', fn($h) => $h->where('entrenadores.id', $entrenadorId));
                });
            });

        $Pagos = $q->get();

        // Mantener compatibilidad con la vista antigua (resumen basado en Pagos)
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

        $centros = \App\Models\Centro::all();

        $entrenadores = \App\Models\Entrenador::orderBy('nombre')->get(['id', 'nombre as name']);

        // Clientes (filas)
        $clientes = User::role('cliente')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        // Si se ha seleccionado un entrenador, limitar la lista a ese entrenador
        if ($entrenadorId) {
            $entrenadoresIdsFromSearch = [$entrenadorId];
        } else {
            $entrenadoresIdsFromSearch = $entrenadores->pluck('id')->toArray();
        }

        // Si se ha seleccionado un cliente, limitar la lista a ese cliente
        if ($clienteId) {
            $clientesIdsFromSearch = [$clienteId];
        } else {
            $clientesIdsFromSearch = $clientes->pluck('id')->toArray();
        }

        // Determinar columnas de entrenador y centro en horarios_clases
        if (Schema::hasColumn('horarios_clases', 'entrenador_id')) {
            $entCol = 'horarios_clases.entrenador_id';
        } elseif (Schema::hasColumn('horarios_clases', 'id_entrenador')) {
            $entCol = 'horarios_clases.id_entrenador';
        } else {
            $entCol = null;
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

        // Matriz inicial vacía
        $matrix = [];

        // 1) Contar desde la tabla `pagos`
        $pagosQuery = Pago::with('entrenadores')->select('id', 'user_id', 'entrenador_id', 'fecha_registro', 'centro', 'importe');
        if ($desde) {
            $pagosQuery->whereDate('fecha_registro', '>=', $desde);
        }
        if ($hasta) {
            $pagosQuery->whereDate('fecha_registro', '<=', $hasta);
        }
        if ($clienteId) {
            $pagosQuery->where('user_id', $clienteId);
        }
        if ($entrenadorId) {
            $pagosQuery->where(function ($q) use ($entrenadorId) {
                $q->where('entrenador_id', $entrenadorId)
                    ->orWhereHas('entrenadores', fn($qq) => $qq->where('entrenadores.id', $entrenadorId));
            });
        }
        if ($centro !== 'todos') {
            $pagosQuery->where('centro', $centro);
        }

        $pagosAll = $pagosQuery->get();

        foreach ($pagosAll as $pago) {
            $cliente = $pago->user_id;
            $trainerIds = [];
            if ($pago->entrenador_id)
                $trainerIds[] = $pago->entrenador_id;
            if ($pago->entrenadores && $pago->entrenadores->count()) {
                foreach ($pago->entrenadores as $t) {
                    $trainerIds[] = $t->id;
                }
            }
            $trainerIds = array_values(array_unique($trainerIds));
            foreach ($trainerIds as $tid) {
                if (!isset($matrix[$cliente][$tid])) {
                    $matrix[$cliente][$tid] = ['count' => 0, 'amount' => 0];
                }
                $matrix[$cliente][$tid]['count'] += 1;
                $matrix[$cliente][$tid]['amount'] += (float) ($pago->importe ?? 0);
            }
        }

        // 2) Añadir conteos desde reservas SOLO cuando no existan ya pagos para ese par cliente/entrenador (o sumarlos si queremos todas las clases)
        // En este caso, el usuario quiere "total de dinero y total de clases", así que sumamos lo que falte
        if ($entCol) {
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

            foreach ($reservasGrouped as $r) {
                $c = $r->cliente_id;
                $t = $r->entrenador_id;
                if (!isset($matrix[$c][$t])) {
                    $matrix[$c][$t] = ['count' => (int) $r->total, 'amount' => 0];
                } else {
                    // Si ya hay pagos, comprobamos si el conteo de reservas es mayor (porque algunas reservas pueden no estar pagadas aún)
                    // O simplemente confiamos en que los pagos ya cubren las reservas. 
                    // Por lo general, si hay pagos, el conteo de pagos es lo que se "factura".
                    // Pero el usuario pide "total de clases", así que usaremos el máximo si divergen o simplemente las clases de reservas si no hay pagos.
                    if ($matrix[$c][$t]['count'] < (int) $r->total) {
                        $matrix[$c][$t]['count'] = (int) $r->total;
                    }
                }
            }
        }

        // Calcular totales por cliente
        $clienteTotals = [];
        foreach ($clientes as $c) {
            $totalClases = 0;
            $totalCoste = 0;
            if (isset($matrix[$c->id])) {
                foreach ($matrix[$c->id] as $tid => $data) {
                    $totalClases += $data['count'];
                    $totalCoste += $data['amount'];
                }
            }
            $clienteTotals[$c->id] = [
                'total_clases' => $totalClases,
                'total_coste' => round($totalCoste, 2)
            ];
        }

        // Filtrar clientes que no tienen datos
        $clientesConDatos = array_keys($matrix);
        $clientes = $clientes->whereIn('id', $clientesConDatos)->values();

        // Filtrar entrenadores que no tienen datos
        $entrenadoresIdsConDatos = [];
        foreach ($matrix as $clienteIdKey => $trainerData) {
            foreach ($trainerData as $tidKey => $val) {
                $entrenadoresIdsConDatos[] = $tidKey;
            }
        }
        $entrenadoresIdsConDatos = array_unique($entrenadoresIdsConDatos);
        $entrenadores = \App\Models\Entrenador::whereIn('id', $entrenadoresIdsConDatos)->orderBy('nombre')->get(['id', 'nombre as name']);

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

    // Devuelve las clases (reservas) que coinciden con cliente y/o entrenador
    public function clases(Request $request)
    {
        $clienteId = $request->query('cliente_id');
        $entrenadorId = $request->query('entrenador_id');
        $centro = $request->query('centro', 'todos');
        $anio = $request->query('anio');
        $mes = $request->query('mes');

        $desde = null;
        $hasta = null;
        if ($mes && $anio) {
            $desde = $anio . '-' . $mes . '-01';
            $hasta = date('Y-m-t', strtotime($desde));
        } elseif ($anio) {
            $desde = $anio . '-01-01';
            $hasta = $anio . '-12-31';
        }

        // Determinar columna entrenador y centro en horarios_clases
        $horarioEntCol = Schema::hasColumn('horarios_clases', 'entrenador_id') ? 'horarios_clases.entrenador_id' : (Schema::hasColumn('horarios_clases', 'id_entrenador') ? 'horarios_clases.id_entrenador' : null);

        $horarioCentroCol = null;
        if (Schema::hasColumn('horarios_clases', 'centro_id')) {
            $horarioCentroCol = 'horarios_clases.centro_id';
        } elseif (Schema::hasColumn('horarios_clases', 'id_centro')) {
            $horarioCentroCol = 'horarios_clases.id_centro';
        } elseif (Schema::hasColumn('horarios_clases', 'centro')) {
            $horarioCentroCol = 'horarios_clases.centro';
        }

        $q = \App\Models\Reserva::query()
            ->select('reservas.*')
            ->join('horarios_clases', 'reservas.id_horario_clase', '=', 'horarios_clases.id');

        if ($clienteId) {
            $q->where('reservas.id_usuario', $clienteId);
        }
        if ($entrenadorId && $horarioEntCol) {
            $q->whereRaw("{$horarioEntCol} = ?", [$entrenadorId]);
        }
        if ($centro !== 'todos' && $horarioCentroCol) {
            $q->where($horarioCentroCol, $centro);
        }
        if ($desde) {
            $q->whereDate('horarios_clases.fecha_hora_inicio', '>=', $desde);
        }
        if ($hasta) {
            $q->whereDate('horarios_clases.fecha_hora_inicio', '<=', $hasta);
        }

        $items = $q->with(['usuario:id,name', 'horarioClase', 'horarioClase.centro', 'horarioClase.entrenador'])->get();

        $result = collect();

        // Map reservas
        foreach ($items as $it) {
            $cliente = $it->usuario?->name ?? null;
            $fecha = $it->horarioClase?->fecha_hora_inicio?->toDateTimeString() ?? null;
            $entrenador = $it->horarioClase?->entrenador?->name ?? null;
            $centroName = $it->horarioClase?->centro?->nombre ?? null;
            $nombreClase = $it->horarioClase?->clase?->nombre ?? null;

            // intentar buscar pago relacionado
            $importe = null;
            $metodo = null;
            $pago = \App\Models\Pago::where('user_id', $it->id_usuario)
                ->where(function ($qq) use ($it) {
                    $entId = $it->horarioClase?->entrenador_id;
                    if ($entId) {
                        $qq->where('entrenador_id', $entId)
                            ->orWhereHas('entrenadores', fn($h) => $h->where('entrenadores.id', $entId));
                    }
                })
                ->whereDate('fecha_registro', optional($it->horarioClase?->fecha_hora_inicio)->toDateString())
                ->first();

            if ($pago) {
                $importe = $pago->importe;
                $metodo = $pago->metodo_pago ?? null;
                $nombreClase = $pago->nombre_clase ?? $nombreClase;
            }

            $result->push([
                'source' => 'reserva',
                'cliente' => $cliente,
                'entrenador' => $entrenador,
                'fecha' => $fecha,
                'importe' => $importe,
                'metodo' => $metodo,
                'nombre_clase' => $nombreClase,
                'centro' => $centroName,
            ]);
        }

        // Map pagos (si hay pagos que no estén representados por reservas)
        $pagoQuery = \App\Models\Pago::with(['user', 'entrenadores']);
        if ($clienteId) {
            $pagoQuery->where('user_id', $clienteId);
        }
        if ($entrenadorId) {
            $pagoQuery->where(function ($q) use ($entrenadorId) {
                $q->where('entrenador_id', $entrenadorId)
                    ->orWhereHas('entrenadores', fn($qq) => $qq->where('entrenadores.id', $entrenadorId));
            });
        }
        if ($desde) {
            $pagoQuery->whereDate('fecha_registro', '>=', $desde);
        }
        if ($hasta) {
            $pagoQuery->whereDate('fecha_registro', '<=', $hasta);
        }
        if ($centro !== 'todos') {
            $pagoQuery->where('centro', $centro);
        }

        $pagos = $pagoQuery->get();

        foreach ($pagos as $p) {
            // Evitar duplicados simples (misma fecha, cliente, entrenador ya procesado como reserva)
            $pFecha = $p->fecha_registro?->toDateTimeString();
            if ($result->where('cliente', $p->user?->name)->where('fecha', $pFecha)->count() > 0) {
                continue;
            }

            $trainerNames = [];
            if ($p->entrenador_id)
                $trainerNames[] = $p->entrenador->name ?? 'Sin nombre';
            foreach ($p->entrenadores as $t)
                $trainerNames[] = $t->name;
            $trainerNames = array_unique($trainerNames);
            $totalTrainers = count($trainerNames);
            if ($totalTrainers > 2) {
                $displayTrainers = array_slice($trainerNames, 0, 2);
                $trainerString = implode(', ', $displayTrainers) . ' + ' . ($totalTrainers - 2) . ' más';
            } else {
                $trainerString = implode(', ', $trainerNames);
            }

            $result->push([
                'source' => 'pago',
                'cliente' => $p->user?->name ?? null,
                'entrenador' => $trainerString,
                'fecha' => $pFecha,
                'importe' => $p->importe,
                'metodo' => $p->metodo_pago ?? null,
                'nombre_clase' => $p->nombre_clase ?? null,
                'centro' => $p->centro ? (Centro::find($p->centro)->nombre ?? $p->centro) : null,
            ]);
        }

        return response()->json($result->values());
    }

}
