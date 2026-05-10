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
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();
            $endOfMonth = $now->copy()->endOfMonth();

            // 1. KPIs Generales (Corregidos)
            $totalClientes = User::role('cliente', 'web')->count();
            $totalEntrenadores = \App\Models\Entrenador::count();
            $ingresosMes = Pago::whereBetween('fecha_registro', [$startOfMonth, $endOfMonth])->sum('importe');
            $sesionesMesCount = Pago::whereBetween('fecha_registro', [$startOfMonth, $endOfMonth])
                ->where('tipo_clase', '!=', 'Suscripción')
                ->count();

            // 2. Análisis de Churn (Altas vs Bajas por Inactividad)
            $churnData = [];
            $mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            // Obtener última actividad de todos los clientes
            $lastActivities = DB::table('pagos')
                ->select('user_id', DB::raw('MAX(fecha_registro) as last_date'))
                ->whereNotNull('user_id')
                ->groupBy('user_id')
                ->get();

            for ($i = 5; $i >= 0; $i--) {
                $mesDate = $now->copy()->subMonths($i);
                $mStart = $mesDate->copy()->startOfMonth();
                $mEnd = $mesDate->copy()->endOfMonth();

                // Altas: Nuevos registros
                $altas = User::role('cliente', 'web')
                    ->whereBetween('created_at', [$mStart, $mEnd])
                    ->count();

                // Bajas: Usuarios cuya ÚLTIMA actividad fue en este mes
                // Y han pasado más de 30 días desde entonces (para meses pasados)
                $bajas = $lastActivities->filter(function($act) use ($mStart, $mEnd) {
                    $date = Carbon::parse($act->last_date);
                    return $date->between($mStart, $mEnd);
                })->count();

                $churnData[] = [
                    'mes' => $mesesNombres[$mesDate->month - 1] . ' ' . $mesDate->format('y'),
                    'altas' => $altas,
                    'bajas' => $bajas
                ];
            }

            // 3. Ingresos Multi-Centro (Líneas comparativas)
            $centros = Centro::all();
            $multiCenterRevenue = [];
            foreach ($centros as $centro) {
                $series = [];
                for ($i = 5; $i >= 0; $i--) {
                    $mesDate = $now->copy()->subMonths($i);
                    $total = Pago::where('centro', $centro->nombre)
                        ->whereYear('fecha_registro', $mesDate->year)
                        ->whereMonth('fecha_registro', $mesDate->month)
                        ->sum('importe');
                    
                    $series[] = [
                        'mes' => $mesesNombres[$mesDate->month - 1],
                        'total' => (float)$total
                    ];
                }
                $multiCenterRevenue[] = [
                    'centro' => $centro->nombre,
                    'color' => $centro->color_hex ?? '#38C1A3',
                    'data' => $series
                ];
            }

            // 4. Eficiencia de Clases (Ratio de Ocupación)
            // Agrupamos por sesión real
            $occupancyByClass = Pago::where('tipo_clase', '!=', 'Suscripción')
                ->whereNotNull('nombre_clase')
                ->where('capacidad_maxima', '>', 0)
                ->select('nombre_clase', 'fecha_registro', 'centro', 'capacidad_maxima', DB::raw('COUNT(*) as inscritos'))
                ->groupBy('nombre_clase', 'fecha_registro', 'centro', 'capacidad_maxima')
                ->get()
                ->groupBy('nombre_clase')
                ->map(function($sesiones, $clase) {
                    $avg = $sesiones->avg(function($s) {
                        return ($s->inscritos / $s->capacidad_maxima) * 100;
                    });
                    return [
                        'nombre' => $clase,
                        'ratio' => round($avg, 1)
                    ];
                })
                ->sortByDesc('ratio')
                ->take(6)
                ->values();

            // 5. Popularidad de Planes (Suscripciones Activas por Nombre)
            $subscriptionPopularity = DB::table('suscripciones_usuarios')
                ->join('suscripciones', 'suscripciones_usuarios.id_suscripcion', '=', 'suscripciones.id')
                ->select('suscripciones.nombre', DB::raw('COUNT(*) as total'))
                ->where('suscripciones_usuarios.estado', 'activo')
                ->groupBy('suscripciones.nombre')
                ->orderBy('total', 'desc')
                ->get();

            // 6. Últimos Pagos (Enriquecidos)
            $ultimosPagos = Pago::with('user:id,name,foto_de_perfil')
                ->orderBy('fecha_registro', 'desc')
                ->take(6)
                ->get()
                ->map(function ($pago) {
                    return [
                        'id' => $pago->id,
                        'fecha' => $pago->fecha_registro?->format('d M, H:i'),
                        'cliente' => $pago->user ? $pago->user->name : 'N/A',
                        'foto' => $pago->user && $pago->user->foto_de_perfil ? Storage::url($pago->user->foto_de_perfil) : null,
                        'clase' => $pago->nombre_clase,
                        'importe' => $pago->importe,
                        'metodo' => $pago->metodo_pago ?? 'Efectivo'
                    ];
                });

            // 7. Notificaciones (Mantenido)
            $notificaciones = \App\Models\NotificacionEntrenador::with('entrenador')
                ->whereNull('destinatario_id')
                ->orderBy('created_at', 'desc')
                ->take(15)
                ->get();

            return response()->json([
                'kpis' => [
                    'totalClientes' => $totalClientes,
                    'totalEntrenadores' => $totalEntrenadores,
                    'ingresosMes' => $ingresosMes,
                    'sesionesMes' => $sesionesMesCount,
                    'avgOccupancy' => count($occupancyByClass) > 0 ? round($occupancyByClass->avg('ratio'), 1) : 0,
                ],
                'churnData' => $churnData,
                'multiCenterRevenue' => $multiCenterRevenue,
                'occupancyByClass' => $occupancyByClass,
                'subscriptionPopularity' => $subscriptionPopularity,
                'ultimosPagos' => $ultimosPagos,
                'notificaciones' => $notificaciones,
                'centros_list' => $centros,
            ]);

        } catch (\Exception $e) {
            \Log::error('EstadisticasController@data REWORK ERROR: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}
