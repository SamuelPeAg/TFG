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

class EstadisticasController extends Controller
{
    public function index()
    {
        return view('app');
    }

    public function data(Request $request)
    {
        // 1. KPIs Generales
            $totalClientes = 0;
            try {
                $totalClientes = User::role('cliente', 'web')->count();
            } catch (\Exception $e) { \Log::error("Error clientes: " . $e->getMessage()); }

            $totalEntrenadores = 0;
            try {
                $totalEntrenadores = \App\Models\Entrenador::role('entrenador', 'staff')->count();
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
            $centros = Centro::all();
            $sesionesPorCentro = $centros->map(function ($centro) {
                return [
                    'centro' => $centro->nombre,
                    'total' => Pago::where('centro', $centro->nombre)->count()
                ];
            });

            // 5. Clientes por Centro (Breakdown for new metrics)
            $clientesPorCentro = $centros->map(function ($centro) {
                return [
                    'centro' => $centro->nombre,
                    'total' => User::role('cliente', 'web')->where('centro_id', $centro->id)->count()
                ];
            });

            // 6. Ingresos por Centro (Breakdown for new metrics)
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
                'clientesPorCentro' => $clientesPorCentro,
                'ingresosPorCentro' => $ingresosPorCentro,
                'ultimosPagos' => $ultimosPagos,
                'empresas' => Empresa::all(),
                'centros_list' => Centro::with('empresa')->get()
            ]);
    }

    // Gestion de Empresas
    public function storeEmpresa(Request $request) {
        $data = $request->validate([
            'nombre' => 'required',
            'cif_dni' => 'required|unique:empresas,cif_dni',
            'direccion' => 'nullable',
            'cp' => 'nullable',
            'ciudad' => 'nullable',
            'iva_configurable' => 'nullable|numeric'
        ]);
        $empresa = Empresa::create($data);
        return response()->json($empresa);
    }

    public function updateEmpresa(Request $request, Empresa $empresa) {
        $data = $request->validate([
            'nombre' => 'required',
            'cif_dni' => 'required|unique:empresas,cif_dni,'.$empresa->id,
            'direccion' => 'nullable',
            'cp' => 'nullable',
            'ciudad' => 'nullable',
            'iva_configurable' => 'nullable|numeric'
        ]);
        $empresa->update($data);
        return response()->json($empresa);
    }

    public function destroyEmpresa(Empresa $empresa) {
        $empresa->delete();
        return response()->json(['message' => 'Empresa eliminada']);
    }

    // Gestion de Centros
    public function storeCentro(Request $request) {
        $data = $request->validate([
            'nombre' => 'required',
            'cif' => 'nullable',
            'direccion' => 'nullable',
            'cp' => 'nullable',
            'ciudad' => 'nullable',
            'empresa_id' => 'nullable|exists:empresas,id',
            'google_maps_link' => 'nullable'
        ]);
        $centro = Centro::create($data);
        return response()->json($centro);
    }

    public function updateCentro(Request $request, Centro $centro) {
        $data = $request->validate([
            'nombre' => 'required',
            'cif' => 'nullable',
            'direccion' => 'nullable',
            'cp' => 'nullable',
            'ciudad' => 'nullable',
            'empresa_id' => 'nullable|exists:empresas,id',
            'google_maps_link' => 'nullable'
        ]);
        $centro->update($data);
        return response()->json($centro);
    }

    public function destroyCentro(Centro $centro) {
        $centro->delete();
        return response()->json(['message' => 'Centro eliminado']);
    }
}
