<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Pago;
use App\Models\HorarioClase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EstadisticasController extends Controller
{
    public function index(Request $request)
    {
        if ($request->wantsJson() || $request->ajax()) {
            
            // 1. KPIs Generales
            $totalClientes = User::role('cliente')->count();
            $totalEntrenadores = User::role('entrenador')->count();
            
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();
            
            $ingresosMes = Pago::whereBetween('fecha_registro', [$startOfMonth, $endOfMonth])->sum('importe');
            
            $sesionesMesCount = HorarioClase::whereBetween('fecha_hora_inicio', [$startOfMonth, $endOfMonth])->count();

            // 2. Gráfico de Ingresos (Últimos 6 meses)
            $ingresos6Meses = [];
            for ($i = 5; $i >= 0; $i--) {
                $mes = Carbon::now()->subMonths($i);
                $total = Pago::whereYear('fecha_registro', $mes->year)
                            ->whereMonth('fecha_registro', $mes->month)
                            ->sum('importe');
                
                $mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];    
                $ingresos6Meses[] = [
                    'mes' => $mesesNombres[$mes->month - 1] . " " . $mes->format('y'),
                    'total' => $total
                ];
            }

            // 3. Clases populares (Doughnut)
            $clasesPopulares = DB::table('horarios_clases')
                ->join('clases', 'horarios_clases.clase_id', '=', 'clases.id')
                ->selectRaw('clases.nombre as nombre_clase, COUNT(horarios_clases.id) as total')
                ->groupBy('clases.nombre')
                ->orderByDesc('total')
                ->limit(5)
                ->get();

            // 4. Sesiones por Centro (Bar)
            $sesionesPorCentro = DB::table('horarios_clases')
                ->leftJoin('centros', 'horarios_clases.centro_id', '=', 'centros.id')
                ->selectRaw('COALESCE(centros.nombre, "Sin centro") as centro, COUNT(horarios_clases.id) as total')
                ->groupBy('centro')
                ->get();

            // 5. Últimos movimientos (Tabla)
            $ultimosPagos = Pago::with('user')
                ->orderBy('fecha_registro', 'desc')
                ->take(5)
                ->get()
                ->map(function ($pago) {
                    return [
                        'id' => $pago->id,
                        'fecha' => Carbon::parse($pago->fecha_registro)->format('d/m H:i'),
                        'cliente' => $pago->user ? $pago->user->name : 'N/A',
                        'clase' => $pago->nombre_clase,
                        'importe' => $pago->importe
                    ];
                });

            return response()->json([
                'kpis' => [
                    'totalClientes' => $totalClientes,
                    'totalEntrenadores' => $totalEntrenadores,
                    'ingresosMes' => $ingresosMes,
                    'sesionesMes' => $sesionesMesCount
                ],
                'ingresos6Meses' => $ingresos6Meses,
                'popularidadClases' => $clasesPopulares,
                'sesionesPorCentro' => $sesionesPorCentro,
                'ultimosPagos' => $ultimosPagos
            ]);
        }

        return view('app');
    }
}
