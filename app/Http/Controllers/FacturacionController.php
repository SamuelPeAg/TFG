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

        $comisionEntrenador = 0.50;

        // --- LÓGICA ENTRENADORES (Liquidaciones) ---
        // Soportamos que una sesión tenga varios entrenadores
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
                    // Si el usuario filtró por un entrenador específico, solo mostramos ese en el resumen
                    if ($e_entrenadorId && $t->id != $e_entrenadorId) continue;
                    $this->_sumarLiquidacion($resumenEntrenadores, $t->name, $s, $comisionEntrenador, $numTrainers);
                }
            }
        }

        // --- LÓGICA CENTROS (Rentabilidad) ---
        $qc = Pago::query()->with('entrenadores')
            ->when($c_desde, fn($q) => $q->whereDate('fecha_registro', '>=', $c_desde))
            ->when($c_hasta, fn($q) => $q->whereDate('fecha_registro', '<=', $c_hasta))
            ->when($c_centro !== 'todos', fn($q) => $q->where('centro', $c_centro));
        
        $pagosC = $qc->get();
        $resumenCentros = [];
        $totalGastosPersonal = 0;

        foreach ($pagosC as $s) {
            $c = $s->centro ?? 'Sin centro';
            if (!isset($resumenCentros[$c])) {
                $resumenCentros[$c] = ['sesiones' => 0, 'bruto' => 0, 'neto' => 0];
            }
            $resumenCentros[$c]['sesiones']++;
            $generado = (float) ($s->importe ?? 0);
            $resumenCentros[$c]['bruto'] += $generado;
            
            // El gasto de personal de esta sesión es el 50% de lo generado
            $gastoSesion = $generado * $comisionEntrenador;
            $resumenCentros[$c]['neto'] += ($generado - $gastoSesion);
            $totalGastosPersonal += $gastoSesion;
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

        return view('facturacion.facturas', [
            'centros' => $centrosLista,
            'entrenadores' => $entrenadoresLista,
            'resumenEntrenadores' => $resumenEntrenadores,
            'resumenCentros' => $resumenCentros,
            'stats' => $statsGlobales,
            'e_desde' => $e_desde, 'e_hasta' => $e_hasta, 'e_entrenadorId' => $e_entrenadorId,
            'c_desde' => $c_desde, 'c_hasta' => $c_hasta, 'c_centro' => $c_centro,
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
        // La liquidación se divide entre los entrenadores que impartieron la sesión
        $resumen[$nombre]['liquidacion'] += ($importe * $comision) / $divisor;
    }

    public function descargarFactura(Request $request)
    {
        $type = $request->query('type', 'trainer');
        $desde = $request->query('desde', '');
        $hasta = $request->query('hasta', '');
        $entrenadorId = $request->query('entrenador_id', '');
        $centro = $request->query('centro', 'todos');
        $comisionEntrenador = 0.50;

        $q = Pago::query()->with(['entrenadores', 'user'])
            ->when($desde, fn($qq) => $qq->whereDate('fecha_registro', '>=', $desde))
            ->when($hasta, fn($qq) => $qq->whereDate('fecha_registro', '<=', $hasta))
            ->when($type === 'trainer' && $entrenadorId, fn($qq) => $qq->whereHas('entrenadores', fn($t) => $t->where('users.id', $entrenadorId)))
            ->when($type === 'center' && $centro !== 'todos', fn($qq) => $qq->where('centro', $centro));

        $Pagos = $q->get();

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
            
            // Calculamos la liquidación para este reporte
            $numT = count($assignedTrainersList) ?: 1;
            if ($type === 'trainer' && $entrenadorId) {
                // Si es factura para UN entrenador, solo sumamos SU parte
                $parteEnte = ($importe * $comisionEntrenador) / $numT;
                $items[$key]['liquidacion'] += $parteEnte;
                $totalLiquidacionCalculada += $parteEnte;
            } else {
                // Si es reporte de centro, sumamos el gasto TOTAL de personal de esa sesión (50%)
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
