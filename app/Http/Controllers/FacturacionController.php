<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Sessiones;
use App\Models\User;
use Illuminate\Http\Request;

class FacturacionController extends Controller
{
    public function index(Request $request)
    {
        // 1. FILTROS ENTRENADORES
        $e_desde = $request->query('e_desde', '');
        $e_hasta = $request->query('e_hasta', '');
        $e_entrenadorId = $request->query('e_entrenador_id', '');

        // 2. FILTROS CENTROS
        $c_desde = $request->query('c_desde', '');
        $c_hasta = $request->query('c_hasta', '');
        $c_centro = $request->query('c_centro', 'todos');

        // 3. FILTROS CLIENTES
        $u_desde = $request->query('u_desde', '');
        $u_hasta = $request->query('u_hasta', '');
        $u_clienteId = $request->query('u_cliente_id', '');

        $comisionEntrenador = 0.50;

        // --- LÓGICA ENTRENADORES (Liquidaciones) ---
        $qe = Pago::query()->with(['entrenadores:id,name'])
            ->when($e_desde, fn($q) => $q->whereDate('fecha_registro', '>=', $e_desde))
            ->when($e_hasta, fn($q) => $q->whereDate('fecha_registro', '<=', $e_hasta))
            ->when($e_entrenadorId, fn($q) => $q->whereHas('entrenadores', fn($qq) => $qq->where('users.id', $e_entrenadorId)));
        
        $pagosE = $qe->get();
        $resumenEntrenadores = [];
        
        foreach ($pagosE as $s) {
            $assigned = $s->entrenadores;
            if ($assigned->isEmpty()) {
                $this->_sumarLiquidacion($resumenEntrenadores, 'Sin entrenador', $s, $comisionEntrenador, 1);
            } else {
                $numTrainers = $assigned->count();
                foreach ($assigned as $t) {
                    if ($e_entrenadorId && $t->id != $e_entrenadorId) continue;
                    $this->_sumarLiquidacion($resumenEntrenadores, $t->name, $s, $comisionEntrenador, $numTrainers);
                }
            }
        }

        // --- LÓGICA CENTROS (Rentabilidad) ---
        $qc = Pago::query()->when($c_desde, fn($q) => $q->whereDate('fecha_registro', '>=', $c_desde))
            ->when($c_hasta, fn($q) => $q->whereDate('fecha_registro', '<=', $c_hasta))
            ->when($c_centro !== 'todos', fn($q) => $q->where('centro', $c_centro));
        
        $pagosC = $qc->get();
        $resumenCentros = [];
        $totalGastosPersonal = 0;

        foreach ($pagosC as $s) {
            $c = $s->centro ?? 'Sin centro';
            if (!isset($resumenCentros[$c])) $resumenCentros[$c] = ['sesiones' => 0, 'bruto' => 0, 'neto' => 0];
            
            $resumenCentros[$c]['sessions'] = ($resumenCentros[$c]['sesiones'] ?? 0) + 1; // Fix typo key consistency if needed, sticking to 'sesiones'
            $resumenCentros[$c]['sesiones']++;
            
            $generado = (float) ($s->importe ?? 0);
            $resumenCentros[$c]['bruto'] += $generado;
            
            $gastoSesion = $generado * $comisionEntrenador;
            $resumenCentros[$c]['neto'] += ($generado - $gastoSesion);
            $totalGastosPersonal += $gastoSesion;
        }

        // --- LÓGICA CLIENTES (Facturación) ---
        $qu = Pago::query()->with(['user', 'entrenadores'])
            ->when($u_desde, fn($q) => $q->whereDate('fecha_registro', '>=', $u_desde))
            ->when($u_hasta, fn($q) => $q->whereDate('fecha_registro', '<=', $u_hasta))
            ->when($u_clienteId, fn($q) => $q->where('user_id', $u_clienteId));

        $pagosU = $qu->get();
        $resumenClientes = [];

        foreach ($pagosU as $p) {
            $clientId = $p->user_id;
            $clientName = $p->user->name ?? 'Cliente Eliminado';
            
            if (!isset($resumenClientes[$clientId])) {
                $resumenClientes[$clientId] = [
                    'id' => $clientId,
                    'nombre' => $clientName,
                    'sesiones' => 0,
                    'bruto' => 0,
                    'entrenadores' => []
                ];
            }
            $resumenClientes[$clientId]['sesiones']++;
            $resumenClientes[$clientId]['bruto'] += (float) ($p->importe ?? 0);
            
            foreach ($p->entrenadores as $t) {
                $resumenClientes[$clientId]['entrenadores'][$t->id] = $t->name; // Use ID as key to deduplicate
            }
        }


        $brutoGlobal = $pagosC->sum('importe');
        $statsGlobales = [
            'bruto' => $brutoGlobal,
            'gastos' => $totalGastosPersonal,
            'neto' => $brutoGlobal - $totalGastosPersonal,
            'sesiones' => $pagosC->count(),
            'centros_activos' => $pagosC->unique('centro')->count(),
            'margen_medio' => $brutoGlobal > 0 ? (($brutoGlobal - $totalGastosPersonal) / $brutoGlobal) * 100 : 0
        ];

        $centrosLista = Pago::query()->select('centro')->distinct()->pluck('centro');
        $entrenadoresLista = User::role('entrenador')->orderBy('name')->get(['id', 'name']);
        
        // Obtenemos clientes que tengan pagos o rol cliente. Para simplificar, los que tienen pagos.
        // O mejor: User role cliente.
        $clientesLista = User::role('cliente')->orderBy('name')->get(['id', 'name']);

        return view('facturacion.facturas', [
            'centros' => $centrosLista,
            'entrenadores' => $entrenadoresLista,
            'clientes' => $clientesLista,
            'resumenEntrenadores' => $resumenEntrenadores,
            'resumenCentros' => $resumenCentros,
            'resumenClientes' => $resumenClientes,
            'stats' => $statsGlobales,
            'e_desde' => $e_desde, 'e_hasta' => $e_hasta, 'e_entrenadorId' => $e_entrenadorId,
            'c_desde' => $c_desde, 'c_hasta' => $c_hasta, 'c_centro' => $c_centro,
            'u_desde' => $u_desde, 'u_hasta' => $u_hasta, 'u_clienteId' => $u_clienteId,
        ]);
    }

    private function _sumarLiquidacion(&$resumen, $nombre, $pago, $comision, $divisor)
    {
        if (!isset($resumen[$nombre])) {
            $resumen[$nombre] = ['sesiones' => 0, 'bruto' => 0, 'liquidacion' => 0];
        }
        $resumen[$nombre]['sesiones']++;
        $importe = (float) ($pago->importe ?? 0);
        $resumen[$nombre]['bruto'] += $importe;
        $resumen[$nombre]['liquidacion'] += ($importe * $comision) / $divisor;
    }

    public function descargarFactura(Request $request)
    {
        $type = $request->query('type', 'trainer');
        $desde = $request->query('desde', '');
        $hasta = $request->query('hasta', '');
        // Entrenador filters
        $entrenadorId = $request->query('entrenador_id', '');
        // Centro filters
        $centro = $request->query('centro', 'todos');
        // Client filters
        $clienteId = $request->query('cliente_id', '');

        $comisionEntrenador = 0.50;

        $q = Pago::query()->with(['entrenadores', 'user'])
            ->when($desde, fn($qq) => $qq->whereDate('fecha_registro', '>=', $desde))
            ->when($hasta, fn($qq) => $qq->whereDate('fecha_registro', '<=', $hasta))
            ->when($type === 'trainer' && $entrenadorId, fn($qq) => $qq->whereHas('entrenadores', fn($t) => $t->where('users.id', $entrenadorId)))
            ->when($type === 'center' && $centro !== 'todos', fn($qq) => $qq->where('centro', $centro))
            ->when($type === 'client' && $clienteId, fn($qq) => $qq->where('user_id', $clienteId));

        $Pagos = $q->get();

        // Si es cliente, usamos otra vista
        if ($type === 'client') {
             $cliente = $clienteId ? User::find($clienteId) : null;
             return view('facturacion.invoice_client', [
                 'pagos' => $Pagos,
                 'cliente' => $cliente,
                 'desde' => $desde,
                 'hasta' => $hasta,
                 'total' => $Pagos->sum('importe')
             ]);
        }

        // Logic for Trainer/Center...
        $items = [];
        $totalLiquidacionCalculada = 0;

        foreach ($Pagos as $p) {
            $fecha = $p->fecha_registro ? \Carbon\Carbon::parse($p->fecha_registro)->format('d/m/Y') : 'S/F';
            $nombreSesion = $p->nombre_clase ?? 'Sesión';
            $centroName = $p->centro ?? 'Centro';
            
            $assignedTrainersList = $p->entrenadores->pluck('name')->toArray();
            $trainersStr = !empty($assignedTrainersList) ? implode(', ', $assignedTrainersList) : 'Sin asignar';
            
            $key = "{$nombreSesion} - {$fecha} ({$centroName}) - [{$trainersStr}]";
            
            if (!isset($items[$key])) {
                $items[$key] = ['nombre' => $key, 'sesiones' => 0, 'total' => 0, 'liquidacion' => 0];
            }
            $items[$key]['sesiones']++;
            $importe = (float)($p->importe ?? 0);
            $items[$key]['total'] += $importe;
            
            $numT = count($assignedTrainersList) ?: 1;
            if ($type === 'trainer' && $entrenadorId) {
                $parteEnte = ($importe * $comisionEntrenador) / $numT;
                $items[$key]['liquidacion'] += $parteEnte;
                $totalLiquidacionCalculada += $parteEnte;
            } else {
                // center report
                $gastoTotal = $importe * $comisionEntrenador;
                $items[$key]['liquidacion'] += $gastoTotal;
                $totalLiquidacionCalculada += $gastoTotal;
            }
        }

        return view('facturacion.invoice', [
            'items' => $items,
            'totalBruto' => $Pagos->sum('importe'),
            'totalLiquidacion' => $totalLiquidacionCalculada,
            'comision' => $comisionEntrenador * 100,
            'desde' => $desde,
            'hasta' => $hasta,
            'centro' => $centro !== 'todos' ? $centro : 'Todos los centros',
            'entrenador' => $entrenadorId ? User::find($entrenadorId) : null,
            'esGlobal' => $type === 'center' || !$entrenadorId,
            'isCenterReport' => $type === 'center'
        ]);
    }
}
