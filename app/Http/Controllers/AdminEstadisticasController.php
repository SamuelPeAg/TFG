<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pago;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminEstadisticasController extends Controller
{
    public function index()
    {
        // KPIs Generales
        $totalClientes = User::role('cliente')->count();
        $totalEntrenadores = User::role('entrenador')->count();
        
        $mesActual = Carbon::now();
        $ingresosMes = Pago::whereMonth('fecha_registro', $mesActual->month)
            ->whereYear('fecha_registro', $mesActual->year)
            ->sum('importe');
            
        // Contamos sesiones únicas (agrupadas por fecha, clase y centro)
        $sesionesMes = Pago::whereMonth('fecha_registro', $mesActual->month)
            ->whereYear('fecha_registro', $mesActual->year)
            ->select('fecha_registro', 'nombre_clase', 'centro')
            ->groupBy('fecha_registro', 'nombre_clase', 'centro')
            ->get()
            ->count();

        // Datos para gráfico: Ingresos últimos 6 meses
        $ingresos6Meses = Pago::select(
                DB::raw('SUM(importe) as total'),
                DB::raw("DATE_FORMAT(fecha_registro, '%Y-%m') as mes")
            )
            ->groupBy('mes')
            ->orderBy('mes', 'desc')
            ->limit(6)
            ->get()
            ->reverse();

        // Datos para gráfico: Popularidad de clases (Top 5)
        $popularidadClases = Pago::select('nombre_clase', DB::raw('count(*) as total'))
            ->groupBy('nombre_clase')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // Datos para gráfico: Sesiones por Centro
        $sesionesPorCentro = Pago::select('centro', DB::raw('count(*) as total'))
            ->groupBy('centro')
            ->get();

        // Últimos movimientos
        $ultimosPagos = Pago::with('user')
            ->orderBy('fecha_registro', 'desc')
            ->limit(10)
            ->get();

        $centros = \App\Models\Centro::all();

        return view('admin.estadisticas', compact(
            'totalClientes', 
            'totalEntrenadores', 
            'ingresosMes', 
            'sesionesMes',
            'ingresos6Meses', 
            'popularidadClases', 
            'sesionesPorCentro', 
            'ultimosPagos',
            'centros'
        ));
    }
}
