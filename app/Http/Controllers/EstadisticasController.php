<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Pago;
use App\Models\HorarioClase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Empresa;
use App\Models\Centro;
use App\Models\TipoSesion;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EstadisticasController extends Controller
{
    public function index()
    {
        return view('app');
    }

    public function data(Request $request)
    {
        try {
        // 1. KPIs Generales
            $totalClientes = 0;
            try {
                $totalClientes = User::role('cliente', 'web')
                    ->where('activo', true)
                    ->count();
            } catch (\Exception $e) { \Log::error("Error clientes: " . $e->getMessage()); }

            $totalEntrenadores = 0;
            try {
                $totalEntrenadores = \App\Models\Entrenador::role('entrenador', 'staff')
                    ->where('activo', true)
                    ->count();
            } catch (\Exception $e) { \Log::error("Error entrenadores: " . $e->getMessage()); }
            
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();
            
            $ingresosMes = 0;
            try {
                $ingresosMes = Pago::whereBetween('fecha_registro', [$startOfMonth, $endOfMonth])->sum('importe');
            } catch (\Exception $e) { }
            
            $sesionesMesCount = 0;
            try {
                $sesionesMesCount = Pago::whereBetween('fecha_registro', [$startOfMonth, $endOfMonth])->count();
            } catch (\Exception $e) { }

            // 2. Gráfico de Ingresos (Últimos 6 meses)
            $ingresos6Meses = [];
            $mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            for ($i = 5; $i >= 0; $i--) {
                $mes = Carbon::now()->subMonths($i);
                $total = 0;
                try {
                    $total = Pago::whereYear('fecha_registro', $mes->year)
                                ->whereMonth('fecha_registro', $mes->month)
                                ->sum('importe');
                } catch (\Exception $e) { \Log::error("Error ingresos mes: " . $e->getMessage()); }
                $ingresos6Meses[] = [
                    'mes'   => $mesesNombres[$mes->month - 1] . ' ' . $mes->format('y'),
                    'total' => $total
                ];
            }

            // 3. Clases populares (Doughnut)
            $clasesPopulares = collect();
            try {
                $clasesPopulares = Pago::selectRaw('nombre_clase, COUNT(*) as total')
                    ->whereNotNull('nombre_clase')
                    ->where('nombre_clase', '!=', '')
                    ->where('tipo_clase', '!=', 'Suscripción') // Excluir abonos de suscripciones
                    ->groupBy('nombre_clase')
                    ->orderByDesc('total')
                    ->limit(5)
                    ->get()
                    ->map(function($p) {
                        return [
                            'nombre_clase' => $p->nombre_clase,
                            'total' => $p->total
                        ];
                    });
            } catch (\Exception $e) { \Log::error("Error clasesPopulares: " . $e->getMessage()); }

            // 4. Sesiones por Centro (Bar)
            $centros = Centro::all();
            
            // 4. Sesiones por Centro (Bar)
            $sesionesPorCentro = $centros->map(function ($centro) {
                return [
                    'centro' => $centro->nombre,
                    'total' => Pago::where('centro', $centro->nombre)->count()
                ];
            });

            // 5. Clientes por Centro
            $clientesPorCentro = $centros->map(function ($centro) {
                $count = User::role('cliente', 'web')
                    ->where('activo', true)
                    ->where(function($q) use ($centro) {
                        $q->where('centro_id', $centro->id)
                          ->orWhereIn('id', function($sub) use ($centro) {
                              $sub->select('user_id')
                                  ->from('pagos')
                                  ->where('centro', $centro->nombre);
                          });
                    })
                    ->count();

                return [
                    'centro' => $centro->nombre,
                    'total' => $count
                ];
            });

            // 6. Ingresos por Centro
            $ingresosPorCentro = $centros->map(function ($centro) {
                return [
                    'centro' => $centro->nombre,
                    'total' => Pago::where('centro', $centro->nombre)->sum('importe')
                ];
            });

            // 7. Últimos movimientos (Tabla)
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

            $centrosList = collect();
            try { $centrosList = Centro::all(); } catch (\Exception $e) { \Log::error("Error centrosList: " . $e->getMessage()); }


            // 9. Notificaciones de Entrenadores
            $notificaciones = collect();
            try {
                $notificaciones = \App\Models\NotificacionEntrenador::with('entrenador')
                    ->whereNull('destinatario_id')
                    ->orderBy('created_at', 'desc')
                    ->take(20)
                    ->get();
            } catch (\Exception $e) { \Log::error('Error notificaciones: ' . $e->getMessage()); }


            return response()->json([
                'kpis' => [
                    'totalClientes'     => $totalClientes,
                    'totalEntrenadores' => $totalEntrenadores,
                    'ingresosMes'       => $ingresosMes,
                    'sesionesMes'       => $sesionesMesCount
                ],
                'ingresos6Meses'    => $ingresos6Meses,
                'popularidadClases' => $clasesPopulares,
                'sesionesPorCentro' => $sesionesPorCentro,
                'clientesPorCentro' => $clientesPorCentro,
                'ingresosPorCentro' => $ingresosPorCentro,
                'ultimosPagos'      => $ultimosPagos,
                'notificaciones'    => $notificaciones,
                'centros_list'      => $centrosList,
            ]);

        } catch (\Exception $e) {
            \Log::error('EstadisticasController@data FATAL: ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['error' => 'Error interno al cargar estadísticas.'], 500);
        }
    }

}
