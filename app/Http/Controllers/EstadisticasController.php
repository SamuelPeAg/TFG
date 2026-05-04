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
                $totalClientes = User::role('cliente', 'web')->where('activo', true)->count();
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

            $empresas = collect();
            try { $empresas = Empresa::all(); } catch (\Exception $e) { \Log::error("Error empresas: " . $e->getMessage()); }

            $centrosList = collect();
            try { $centrosList = Centro::with('empresa')->get(); } catch (\Exception $e) { \Log::error("Error centrosList: " . $e->getMessage()); }

            // 8. Tipos de Sesión (agrupados por centro)
            $tiposSesion = collect();
            try {
                $tiposSesion = TipoSesion::with('centro')
                    ->withTrashed(false)
                    ->orderBy('centro_id')
                    ->orderBy('orden')
                    ->orderBy('nombre')
                    ->get()
                    ->map(fn($t) => [
                        'id'                 => $t->id,
                        'nombre'             => $t->nombre,
                        'slug'               => $t->slug,
                        'capacidad_personas' => $t->capacidad_personas,
                        'capacidad_fija'     => $t->capacidad_fija,
                        'precio_base'        => $t->precio_base,
                        'color_hex'          => $t->color_hex,
                        'activo'             => $t->activo,
                        'orden'              => $t->orden,
                        'descripcion'        => $t->descripcion,
                        'centro_id'          => $t->centro_id,
                        'centro_nombre'      => $t->centro?->nombre ?? 'Global (todos los centros)',
                        'tipos_credito_ids'  => $t->tiposCredito->pluck('id')->toArray(),
                    ]);
            } catch (\Exception $e) { \Log::error('Error tiposSesion: ' . $e->getMessage()); }

            // 9. Notificaciones de Entrenadores
            $notificaciones = collect();
            try {
                $notificaciones = \App\Models\NotificacionEntrenador::with('entrenador')
                    ->whereNull('destinatario_id')
                    ->orderBy('created_at', 'desc')
                    ->take(20)
                    ->get();
            } catch (\Exception $e) { \Log::error('Error notificaciones: ' . $e->getMessage()); }

            // 10. Tipos de Crédito
            $tiposCredito = collect();
            try {
                $tiposCredito = \App\Models\TipoCredito::with('sesiones')->get();
            } catch (\Exception $e) { \Log::error('Error tiposCredito: ' . $e->getMessage()); }

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
                'empresas'          => $empresas,
                'centros_list'      => $centrosList,
                'tipos_sesion'      => $tiposSesion,
                'tipos_credito'     => $tiposCredito,
                'notificaciones'    => $notificaciones,
            ]);

        } catch (\Exception $e) {
            \Log::error('EstadisticasController@data FATAL: ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['error' => 'Error interno al cargar estadísticas.'], 500);
        }
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

    // -------------------------------------------------------------------------
    // Gestión de Tipos de Sesión
    // -------------------------------------------------------------------------

    public function indexTiposSesion()
    {
        $tipos = TipoSesion::with('centro')
            ->orderBy('centro_id')
            ->orderBy('orden')
            ->orderBy('nombre')
            ->get();
        return response()->json($tipos);
    }

    public function storeTipoSesion(Request $request)
    {
        // Generar slug si no viene en el request
        if (!$request->filled('slug') && $request->filled('nombre')) {
            $request->merge(['slug' => Str::slug($request->nombre)]);
        }

        $data = $request->validate([
            'nombre'             => 'required|string|max:100',
            'slug'               => [
                'required', 'string', 'max:100',
                Rule::unique('tipos_sesion')->where(function ($query) use ($request) {
                    return $query->where('centro_id', $request->centro_id);
                })
            ],
            'capacidad_personas' => 'required|integer|min:1|max:100',
            'capacidad_fija'     => 'required|boolean',
            'precio_base'        => 'nullable|numeric|min:0',
            'color_hex'          => 'nullable|string|max:7',
            'activo'             => 'nullable|boolean',
            'orden'              => 'nullable|integer|min:0',
            'descripcion'        => 'nullable|string|max:500',
            'centro_id'          => 'nullable|exists:centros,id',
            'tipos_credito'      => 'nullable|array',
            'tipos_credito.*'    => 'exists:tipos_credito,id',
        ]);
        $tipo = TipoSesion::create($data);
        if ($request->has('tipos_credito')) {
            $tipo->tiposCredito()->sync($request->tipos_credito);
        }
        return response()->json($tipo->load(['centro', 'tiposCredito']), 201);
    }

    public function updateTipoSesion(Request $request, TipoSesion $tipoSesion)
    {
        // Asegurar slug
        if (!$request->filled('slug') && $request->filled('nombre')) {
            $request->merge(['slug' => Str::slug($request->nombre)]);
        }

        $data = $request->validate([
            'nombre'             => 'required|string|max:100',
            'slug'               => [
                'required', 'string', 'max:100',
                Rule::unique('tipos_sesion')
                    ->where(function ($query) use ($request) {
                        return $query->where('centro_id', $request->centro_id);
                    })
                    ->ignore($tipoSesion->id)
            ],
            'capacidad_personas' => 'required|integer|min:1|max:100',
            'capacidad_fija'     => 'required|boolean',
            'precio_base'        => 'nullable|numeric|min:0',
            'color_hex'          => 'nullable|string|max:7',
            'activo'             => 'nullable|boolean',
            'orden'              => 'nullable|integer|min:0',
            'descripcion'        => 'nullable|string|max:500',
            'centro_id'          => 'nullable|exists:centros,id',
            'tipos_credito'      => 'nullable|array',
            'tipos_credito.*'    => 'exists:tipos_credito,id',
        ]);
        $tipoSesion->update($data);
        if ($request->has('tipos_credito')) {
            $tipoSesion->tiposCredito()->sync($request->tipos_credito);
        }
        return response()->json($tipoSesion->load(['centro', 'tiposCredito']));
    }

    public function destroyTipoSesion(TipoSesion $tipoSesion)
    {
        $tipoSesion->delete();
        return response()->json(['message' => 'Tipo de sesión eliminado']);
    }
}
