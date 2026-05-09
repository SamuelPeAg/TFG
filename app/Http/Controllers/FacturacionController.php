<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\User;
use App\Models\Centro;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;

class FacturacionController extends Controller
{
    public function index(Request $request)
    {
        $desde = $request->input('desde');
        $hasta = $request->input('hasta');
        $centro = $request->input('centro', 'todos');
        $entrenadorId = $request->input('entrenador_id');
        $clienteId = $request->input('cliente_id');
        $anio = $request->input('anio', date('Y'));
        $mes = $request->input('mes');

        // Limpiar parámetros para evitar vacíos accidentales o espacios
        $clienteId = ($clienteId && $clienteId !== '') ? $clienteId : null;
        $entrenadorId = ($entrenadorId && $entrenadorId !== '') ? $entrenadorId : null;
        $mes = ($mes && $mes !== '') ? $mes : null;
        $centro = ($centro && $centro !== 'todos') ? $centro : 'todos';

        // Si se especifica mes y año, calcular desde y hasta
        if ($mes && $anio) {
            $desde = $anio . '-' . $mes . '-01';
            $hasta = date('Y-m-t', strtotime($desde)); // Último día del mes
        } elseif ($anio && !$mes) {
            $desde = $anio . '-01-01';
            $hasta = $anio . '-12-31';
        }

        $q = Pago::query()
            ->with(['entrenador:id,name', 'entrenadores:id,name'])
            ->when($desde, fn($qq) => $qq->whereDate('fecha_registro', '>=', $desde))
            ->when($hasta, fn($qq) => $qq->whereDate('fecha_registro', '<=', $hasta))
            ->when($centro !== 'todos', fn($qq) => $qq->where('centro', $centro))
            ->when($clienteId, fn($qq) => $qq->where('user_id', $clienteId))
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

        $entrenadores = \App\Models\Entrenador::orderBy('name')
            ->get(['id', 'name']);

        // Clientes (filas)
        $clientes = User::role('cliente', 'web')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        // Si se ha seleccionado un entrenador, limitar la lista a ese entrenador
        if ($entrenadorId) {
            $entrenadoresIdsFromSearch = [$entrenadorId];
        } else {
            $entrenadoresIdsFromSearch = $entrenadores->pluck('id')->toArray();
        }

        // Si se ha seleccionado un cliente, limitar la lista a ese cliente únicamente
        if ($clienteId) {
            $clientes = User::where('id', $clienteId)
                ->role('cliente', 'web')
                ->get(['id', 'name', 'email']);
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

        $centroRecord = null;
        if ($centro !== 'todos') {
            $centroRecord = \App\Models\Centro::where('nombre', $centro)->first();
        }

        if (Schema::hasColumn('horarios_clases', 'centro_id')) {
            $centroCol = 'horarios_clases.centro_id';
            $centroVal = $centroRecord?->id;
        } elseif (Schema::hasColumn('horarios_clases', 'id_centro')) {
            $centroCol = 'horarios_clases.id_centro';
            $centroVal = $centroRecord?->id;
        } elseif (Schema::hasColumn('horarios_clases', 'centro')) {
            $centroCol = 'horarios_clases.centro';
            $centroVal = $centro;
        } else {
            $centroCol = null;
            $centroVal = null;
        }

        // 1) Obtener conteos y montos desde la tabla `pagos` agrupados por cliente y entrenador
        $matrix = [];
        
        $pagosStats = Pago::query()
            ->selectRaw('user_id, entrenador_id, count(*) as total_clases, sum(importe) as total_importe')
            ->when($desde, fn($q) => $q->whereDate('fecha_registro', '>=', $desde))
            ->when($hasta, fn($q) => $q->whereDate('fecha_registro', '<=', $hasta))
            ->when($clienteId, fn($q) => $q->where('user_id', $clienteId))
            ->when($centro !== 'todos', fn($q) => $q->where('centro', $centro))
            ->whereNotNull('user_id')
            ->groupBy('user_id', 'entrenador_id')
            ->get();

        foreach ($pagosStats as $stat) {
            $matrix[$stat->user_id][$stat->entrenador_id] = [
                'count' => (int) $stat->total_clases,
                'amount' => (float) $stat->total_importe
            ];
        }

        // 2) Añadir conteos desde reservas (para clases pagadas con créditos que no generan fila en `pagos`)
        if ($entCol) {
            $reservasStats = \App\Models\Reserva::query()
                ->selectRaw("reservas.id_usuario as cliente_id, {$entCol} as entrenador_id, count(*) as total")
                ->join('horarios_clases', 'reservas.id_horario_clase', '=', 'horarios_clases.id')
                ->when($desde, fn($q) => $q->whereDate('horarios_clases.fecha_hora_inicio', '>=', $desde))
                ->when($hasta, fn($q) => $q->whereDate('horarios_clases.fecha_hora_inicio', '<=', $hasta))
                ->when($centro !== 'todos' && $centroCol && $centroVal, fn($q) => $q->where($centroCol, $centroVal))
                ->when($entrenadorId, fn($q) => $q->whereRaw("{$entCol} = ?", [$entrenadorId]))
                ->when($clienteId, fn($q) => $q->where('reservas.id_usuario', $clienteId))
                ->groupByRaw("reservas.id_usuario, {$entCol}")
                ->get();

            foreach ($reservasStats as $r) {
                $c = $r->cliente_id;
                $t = $r->entrenador_id;
                if (!isset($matrix[$c][$t])) {
                    $matrix[$c][$t] = ['count' => (int) $r->total, 'amount' => 0];
                } else {
                    // Si el número de reservas es mayor que el de pagos registrados, 
                    // asumimos que el resto son por créditos y actualizamos el contador.
                    if ($matrix[$c][$t]['count'] < (int) $r->total) {
                        $matrix[$c][$t]['count'] = (int) $r->total;
                    }
                }
            }
        }

        // Calcular totales por cliente (ahora mucho más rápido ya que la matriz es pequeña)
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

        // Filtrar clientes que no tienen datos (solo si no se ha filtrado por un cliente específico)
        if (!$clienteId) {
            $clientesConDatos = array_keys($matrix);
            $clientes = $clientes->whereIn('id', $clientesConDatos)->values();
        }

        // Determinar qué entrenadores mostrar en las columnas
        if ($entrenadorId) {
            // Si hay un entrenador seleccionado, solo mostramos ese
            $entrenadores = \App\Models\Entrenador::where('id', $entrenadorId)->get(['id', 'name']);
        } else {
            // Filtrar entrenadores que tienen datos en la matriz
            $entrenadoresIdsConDatos = [];
            foreach ($matrix as $clienteIdKey => $trainerData) {
                foreach ($trainerData as $tidKey => $val) {
                    $entrenadoresIdsConDatos[] = $tidKey;
                }
            }
            $entrenadoresIdsConDatos = array_unique($entrenadoresIdsConDatos);
            
            if (empty($entrenadoresIdsConDatos) && !empty($clienteId)) {
                // Si no hay datos pero hay un cliente seleccionado, podemos mostrar todos para indicar que no hay actividad
                $entrenadores = \App\Models\Entrenador::orderBy('name')->get(['id', 'name']);
            } else {
                $entrenadores = \App\Models\Entrenador::whereIn('id', $entrenadoresIdsConDatos)->orderBy('name')->get(['id', 'name']);
            }
        }

        $todosLosClientes = User::role('cliente', 'web')
            ->with(['suscripciones' => function($q) {
                $q->where('estado', 'activo')->select('id_usuario', 'id_suscripcion');
            }])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
        $todosLosEntrenadores = \App\Models\Entrenador::orderBy('name')->get(['id', 'name']);
        $suscripciones = \App\Models\Suscripcion::orderBy('nombre')->get(['id', 'nombre', 'precio']);

        $data = [
            'centros' => $centros,
            'entrenadores' => $entrenadores,
            'clientes' => $clientes,
            'todosLosClientes' => $todosLosClientes,
            'todosLosEntrenadores' => $todosLosEntrenadores,
            'suscripciones' => $suscripciones,
            'matrix' => $matrix,
            'resumen' => $resumen,
            'clienteTotals' => $clienteTotals,
            'validation_status' => $this->auditData($clientes),
            'desde' => $desde,
            'hasta' => $hasta,
            'centro' => $centro,
            'entrenadorId' => $entrenadorId,
            'clienteId' => $clienteId,
            'anio' => $anio,
            'mes' => $mes,
        ];

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json($this->cleanUtf8($data));
        }

        return view('app');
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
        $centroVal = null;
        if (Schema::hasColumn('horarios_clases', 'centro_id')) {
            $horarioCentroCol = 'horarios_clases.centro_id';
            if ($centro !== 'todos') {
                $centroVal = \App\Models\Centro::where('nombre', $centro)->value('id');
            }
        } elseif (Schema::hasColumn('horarios_clases', 'id_centro')) {
            $horarioCentroCol = 'horarios_clases.id_centro';
            if ($centro !== 'todos') {
                $centroVal = \App\Models\Centro::where('nombre', $centro)->value('id');
            }
        } elseif (Schema::hasColumn('horarios_clases', 'centro')) {
            $horarioCentroCol = 'horarios_clases.centro';
            $centroVal = $centro;
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
        if ($centro !== 'todos' && $horarioCentroCol && $centroVal) {
            $q->where($horarioCentroCol, $centroVal);
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
                $pagoId = $pago->id;
                $numeroCompleto = $pago->numero_completo;
            }

            $result->push([
                'source' => 'reserva',
                'pago_id' => $pagoId ?? null,
                'numero_factura' => $numeroCompleto ?? null,
                'cliente' => $cliente,
                'entrenador' => $entrenador,
                'fecha' => $fecha,
                'importe' => $importe,
                'metodo' => $metodo,
                'nombre_clase' => $nombreClase,
                'centro' => $centroName,
                'creditos' => $it->creditos_gastados ?? 0,
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
                'pago_id' => $p->id,
                'numero_factura' => $p->numero_completo,
                'cliente' => $p->user?->name ?? null,
                'entrenador' => $trainerString,
                'fecha' => $pFecha,
                'importe' => $p->importe,
                'metodo' => $p->metodo_pago ?? null,
                'nombre_clase' => $p->nombre_clase ?? null,
                'centro' => $p->centro,
                'creditos' => 0, // Los pagos directos no suelen gastar créditos de suscripción en este flujo
            ]);
        }

        return response()->json($this->cleanUtf8($result->values()->toArray()));
    }

    /**
     * TPV Terminal (PosTickarModal)
     * Procesa un cobro rápido creando los objetos 'Pago' pertinentes.
     */
    public function tickar(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:users,id',
            'entrenador_id' => 'required|exists:entrenadores,id',
            'centro' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.tipo' => 'required|string',
            'items.*.precio' => 'required|numeric|min:0',
            'importe_entregado' => 'nullable|numeric'
        ]);

        $fecha = \Carbon\Carbon::now();
        $user = \App\Models\User::findOrFail($request->cliente_id);

        foreach ($request->items as $item) {
            $pago = \App\Models\Pago::create([
                'user_id' => $user->id,
                'entrenador_id' => $request->entrenador_id,
                'iban' => $user->iban,
                'importe' => $item['precio'],
                'fecha_registro' => $fecha,
                'centro' => $request->centro,
                'nombre_clase' => $item['tipo'], // ej: 'EP / Duo'
                'tipo_clase' => 'Ticket TPV',
                'metodo_pago' => $request->input('metodo_pago', 'Efectivo'), // Permitir método personalizado (Efectivo, TPV, etc.)
            ]);

            // Si el item es una suscripción, actualizamos el saldo del usuario
            if (isset($item['suscripcion_id']) && $item['suscripcion_id']) {
                $suscripcion = \App\Models\Suscripcion::find($item['suscripcion_id']);
                if ($suscripcion) {
                    $userSub = \App\Models\SuscripcionUsuario::where('id_usuario', $user->id)
                        ->where('id_suscripcion', $suscripcion->id)
                        ->first();
                    
                    if ($userSub) {
                        // Añadimos los créditos definidos en la suscripción
                        $userSub->increment('saldo_actual', $suscripcion->creditos_por_periodo);
                        $userSub->update(['ultima_recarga' => now()]);
                    } else {
                        // Si no la tenía asignada pero la compró, se la asignamos directamente con sus créditos
                        \App\Models\SuscripcionUsuario::create([
                            'id_usuario' => $user->id,
                            'id_suscripcion' => $suscripcion->id,
                            'id_entrenador' => $request->entrenador_id,
                            'saldo_actual' => $suscripcion->creditos_por_periodo,
                            'ultima_recarga' => now(),
                            'estado' => 'activo'
                        ]);
                    }
                }
            }

            // Sync entrenador
            if ($request->entrenador_id) {
                $pago->entrenadores()->sync([$request->entrenador_id]);
            }
        }

        return response()->json($this->cleanUtf8([
            'success' => true,
            'message' => 'Cobro registrado correctamente'
        ]));
    }

    public function exportXML(Request $request)
    {
        $centro = $request->query('centro', 'todos');
        $anio = $request->query('anio', date('Y'));
        $mes = $request->query('mes', '');
        
        $suscripcionesIds = $request->query('suscripciones', []);
        $clientesIds = $request->query('clientes', []);

        $desde = null;
        $hasta = null;
        if ($mes && $anio) {
            $desde = $anio . '-' . $mes . '-01';
            $hasta = date('Y-m-t', strtotime($desde));
        } elseif ($anio) {
            $desde = $anio . '-01-01';
            $hasta = $anio . '-12-31';
        }

        $centroRecord = null;
        if ($centro !== 'todos') {
            $centroRecord = \App\Models\Centro::where('nombre', $centro)->first();
        }

        $xmlContent = '';
        $pdfContent = '';
        $baseFilename = '';

        // Si se han seleccionado suscripciones, generamos un XML de Remesa (Domiciliaciones)
        if (!empty($suscripcionesIds)) {
            $query = \App\Models\SuscripcionUsuario::with(['usuario', 'suscripcion'])
                ->whereIn('id_suscripcion', $suscripcionesIds)
                ->where('estado', 'activo');

            if (!empty($clientesIds)) {
                $query->whereIn('id_usuario', $clientesIds);
            }

            if ($centro !== 'todos') {
                $query->whereHas('usuario.centro', function($q) use ($centro) {
                    $q->where('nombre', $centro);
                });
            }

            $suscripcionesUsuarios = $query->get();

            // Configuración SEPA de la Empresa (tomamos la primera asociada al centro o una por defecto)
            $empresa = null;
            if ($centro !== 'todos' && $centroRecord) {
                $empresa = $centroRecord->empresa;
            }
            if (!$empresa) {
                $empresa = \App\Models\Empresa::first();
            }

            $creditorName = htmlspecialchars($empresa->nombre ?? 'Gimnasio');
            $creditorIBAN = str_replace(' ', '', $empresa->cif_dni ?? ''); // Nota: esto debería ser un IBAN real de la empresa
            $creditorBIC = $empresa->sepa_bic ?? '';
            $creditorID = $empresa->sepa_creditor_id ?? ''; // AT-02 identifier

            $msgId = 'REMESA-' . time();
            $creDtTm = now()->format('Y-m-d\TH:i:s');
            
            $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>');
            $cstmrDrctDbtInitn = $xml->addChild('CstmrDrctDbtInitn');
            
            // Group Header
            $grpHdr = $cstmrDrctDbtInitn->addChild('GrpHdr');
            $grpHdr->addChild('MsgId', $msgId);
            $grpHdr->addChild('CreDtTm', $creDtTm);
            $grpHdr->addChild('NbOfTxs', $suscripcionesUsuarios->count());
            $grpHdr->addChild('CtrlSum', $suscripcionesUsuarios->sum(fn($su) => (float)$su->suscripcion->precio));
            $initgPty = $grpHdr->addChild('InitgPty');
            $initgPty->addChild('Nm', $creditorName);

            // Payment Information
            $pmtInf = $cstmrDrctDbtInitn->addChild('PmtInf');
            $pmtInf->addChild('PmtInfId', 'PMT-' . time());
            $pmtInf->addChild('PmtMtd', 'DD'); // Direct Debit
            $pmtInf->addChild('NbOfTxs', $suscripcionesUsuarios->count());
            $pmtInf->addChild('CtrlSum', $suscripcionesUsuarios->sum(fn($su) => (float)$su->suscripcion->precio));
            
            $pmtTpInf = $pmtInf->addChild('PmtTpInf');
            $svcLvl = $pmtTpInf->addChild('SvcLvl');
            $svcLvl->addChild('Cd', 'SEPA');
            $lclInstrm = $pmtTpInf->addChild('LclInstrm');
            $lclInstrm->addChild('Cd', 'CORE');
            $pmtTpInf->addChild('SeqTyp', 'OOFF'); // One-off or RCUR for recurring

            $pmtInf->addChild('ReqdColltnDt', now()->addDays(2)->format('Y-m-d'));
            
            $cdtr = $pmtInf->addChild('Cdtr');
            $cdtr->addChild('Nm', $creditorName);
            
            $cdtrAcct = $pmtInf->addChild('CdtrAcct');
            $id = $cdtrAcct->addChild('Id');
            $id->addChild('IBAN', $creditorIBAN);
            
            $cdtrAgt = $pmtInf->addChild('CdtrAgt');
            $finInstnId = $cdtrAgt->addChild('FinInstnId');
            if ($creditorBIC) {
                $finInstnId->addChild('BIC', $creditorBIC);
            }

            $cdtrSchmeId = $pmtInf->addChild('CdtrSchmeId');
            $id = $cdtrSchmeId->addChild('Id');
            $prvtId = $id->addChild('PrvtId');
            $othr = $prvtId->addChild('Othr');
            $othr->addChild('Id', $creditorID);
            $schmeNm = $othr->addChild('SchmeNm');
            $schmeNm->addChild('Prtry', 'SEPA');

            $total = 0;
            $items_pdf = [];
            foreach ($suscripcionesUsuarios as $su) {
                $txInf = $pmtInf->addChild('DrctDbtTxInf');
                $pmtId = $txInf->addChild('PmtId');
                $pmtId->addChild('EndToEndId', 'E2E-' . $su->id);
                
                $precio = (float)($su->suscripcion->precio ?? 0);
                $instdAmt = $txInf->addChild('InstdAmt', $precio);
                $instdAmt->addAttribute('Ccy', 'EUR');
                
                $drctDbtTx = $txInf->addChild('DrctDbtTx');
                $mndtRltdInf = $drctDbtTx->addChild('MndtRltdInf');
                $mndtRltdInf->addChild('MndtId', $su->usuario->sepa_mandate_ref ?? ('MND-' . $su->usuario->id));
                $mndtRltdInf->addChild('DtOfSgntr', $su->usuario->sepa_mandate_date ? $su->usuario->sepa_mandate_date : $su->usuario->created_at->format('Y-m-d'));
                
                $dbtrAgt = $txInf->addChild('DbtrAgt');
                $finInstnId = $dbtrAgt->addChild('FinInstnId');
                if ($su->usuario->sepa_bic) {
                    $finInstnId->addChild('BIC', $su->usuario->sepa_bic);
                }

                $dbtr = $txInf->addChild('Dbtr');
                $clienteNombre = $su->usuario->name ?? 'N/A';
                $dbtr->addChild('Nm', htmlspecialchars($clienteNombre));
                
                $dbtrAcct = $txInf->addChild('DbtrAcct');
                $id = $dbtrAcct->addChild('Id');
                $iban = str_replace(' ', '', $su->usuario->iban ?? '');
                $id->addChild('IBAN', $iban);
                
                $rmtInf = $txInf->addChild('RmtInf');
                $concepto = $su->suscripcion->nombre ?? 'Suscripción';
                $rmtInf->addChild('Ustrd', htmlspecialchars($concepto));

                $total += $precio;
                $items_pdf[] = [
                    'Cliente' => $clienteNombre,
                    'IBAN' => $iban ? (substr($iban, 0, 4) . ' **** **** ' . substr($iban, -4)) : 'No definido',
                    'Concepto' => $concepto,
                    'Importe' => $precio
                ];
            }

            $xmlContent = $xml->asXML();
            $baseFilename = "remesa_sepa_{$centro}_{$anio}_{$mes}";

            // Generar PDF
            $pdfData = [
                'titulo' => 'REPORTE DE REMESA BANCARIA',
                'periodo' => ($mes ? "Mes $mes - " : "") . "Año $anio",
                'centro' => $centro,
                'items' => $items_pdf,
                'columnas' => ['Cliente', 'IBAN', 'Concepto', 'Importe'],
                'total' => $total
            ];
            $pdfContent = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.reporte_general', $pdfData)->output();

        } else {
            // General Facturacion
            $query = Pago::with(['user', 'entrenadores'])
                ->when($desde, fn($q) => $q->whereDate('fecha_registro', '>=', $desde))
                ->when($hasta, fn($q) => $q->whereDate('fecha_registro', '<=', $hasta))
                ->when($centro !== 'todos', fn($q) => $q->where('centro', $centro));

            $pagos = $query->get();

            $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><facturacion/>');
            $xml->addChild('periodo', ($mes ? "Mes $mes - " : "") . "Año $anio");
            $xml->addChild('centro', $centro);
            
            $total = 0;
            $items_pdf = [];
            foreach ($pagos as $pago) {
                $item = $xml->addChild('pago');
                $item->addChild('id', $pago->id);
                $clienteNombre = $pago->user->name ?? 'N/A';
                $item->addChild('cliente', htmlspecialchars($clienteNombre));
                $fecha = $pago->fecha_registro->toDateTimeString();
                $item->addChild('fecha', $fecha);
                $item->addChild('importe', $pago->importe);
                $metodo = $pago->metodo_pago ?? '';
                $item->addChild('metodo', htmlspecialchars($metodo));
                $clase = $pago->nombre_clase ?? '';
                $item->addChild('clase', htmlspecialchars($clase));
                
                $total += (float)$pago->importe;

                $items_pdf[] = [
                    'ID' => $pago->id,
                    'Cliente' => $clienteNombre,
                    'Fecha' => $pago->fecha_registro->format('d/m/Y'),
                    'Metodo' => $metodo,
                    'Servicio' => $clase,
                    'Importe' => (float)$pago->importe
                ];
            }
            $xml->addChild('total_acumulado', $total);
            $xmlContent = $xml->asXML();
            $baseFilename = "facturacion_{$centro}_{$anio}_{$mes}";

            // Generar PDF
            $pdfData = [
                'titulo' => 'REPORTE DE FACTURACIÓN Y PAGOS',
                'periodo' => ($mes ? "Mes $mes - " : "") . "Año $anio",
                'centro' => $centro,
                'items' => $items_pdf,
                'columnas' => ['ID', 'Cliente', 'Fecha', 'Metodo', 'Servicio', 'Importe'],
                'total' => $total
            ];
            $pdfContent = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.reporte_general', $pdfData)->output();
        }

        // Crear ZIP temporal
        try {
            $zip = new \ZipArchive();
            $zipFilename = $baseFilename . ".zip";
            $zipPath = tempnam(sys_get_temp_dir(), 'export_zip');

            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE)) {
                $zip->addFromString($baseFilename . ".xml", $xmlContent);
                $zip->addFromString($baseFilename . ".pdf", $pdfContent);
                $zip->close();
            } else {
                throw new \Exception("No se pudo crear el archivo ZIP.");
            }

            return response()->download($zipPath, $zipFilename)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            \Log::error("Error en exportación de facturación: " . $e->getMessage());
            return response()->json(['error' => 'Error al generar el archivo de exportación: ' . $e->getMessage()], 500);
        }
    }

    public function downloadFacturaPdf($id)
    {
        $pago = Pago::with(['user', 'entrenadores', 'centro_rel.empresa'])->findOrFail($id);
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.factura', compact('pago'));
        
        $filename = $pago->numero_completo ? 'factura-' . $pago->numero_completo : 'factura-' . str_pad($pago->id, 5, '0', STR_PAD_LEFT);
        
        return $pdf->download($filename . '.pdf');
    }

    private function auditData($clientes)
    {
        $status = [];
        foreach ($clientes as $c) {
            $errors = [];
            
            // Validar DNI
            if (!$c->dni) {
                $errors[] = 'Falta DNI';
            } else {
                $validator = \Validator::make(['dni' => $c->dni], ['dni' => 'nif']);
                if ($validator->fails()) {
                    $errors[] = 'DNI inválido';
                }
            }

            // Validar IBAN
            if (!$c->iban) {
                $errors[] = 'Falta IBAN';
            } else {
                $cleanIban = str_replace(' ', '', $c->iban);
                $validator = \Validator::make(['iban' => $cleanIban], ['iban' => 'iban']);
                if ($validator->fails()) {
                    $errors[] = 'IBAN inválido';
                }
            }

            // Validar Mandato (Opcional pero recomendable si hay IBAN)
            if ($c->iban && !$c->sepa_mandate_ref) {
                $errors[] = 'Falta Ref. Mandato';
            }

            if (!empty($errors)) {
                $status[$c->id] = $errors;
            }
        }
        return $status;
    }

    /**
     * Recursively clean non-UTF8 characters from data to prevent json_encode errors.
     */
    private function cleanUtf8($data)
    {
        if (is_string($data)) {
            // Attempt to convert to UTF-8 and remove invalid sequences
            return mb_convert_encoding($data, 'UTF-8', 'UTF-8');
        } elseif (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->cleanUtf8($value);
            }
        } elseif (is_object($data)) {
            if ($data instanceof \Illuminate\Database\Eloquent\Model) {
                return $this->cleanUtf8($data->toArray());
            } elseif ($data instanceof \Illuminate\Support\Collection) {
                return $this->cleanUtf8($data->toArray());
            }
        }
        return $data;
    }
}
