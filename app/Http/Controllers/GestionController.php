<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Empresa;
use App\Models\Centro;
use App\Models\TipoSesion;
use App\Models\TipoCredito;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GestionController extends Controller
{
    private function parseCoordinates($link)
    {
        if (!$link) return [null, null];

        // Si es un iframe completo, extraer solo el src
        if (preg_match('/src="([^"]+)"/', $link, $matches)) {
            $link = $matches[1];
        }

        $lat = null;
        $lng = null;

        // 1. Formato Embed (!2d...!3d...)
        if (preg_match('/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/', $link, $matches)) {
            $lng = $matches[1];
            $lat = $matches[2];
        }
        // 2. Formato @lat,lng
        elseif (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $link, $matches)) {
            $lat = $matches[1];
            $lng = $matches[2];
        }
        // 3. Formato q=lat,lng
        elseif (preg_match('/q=(-?\d+\.\d+),(-?\d+\.\d+)/', $link, $matches)) {
            $lat = $matches[1];
            $lng = $matches[2];
        }

        return [$lat, $lng];
    }

    public function index()
    {
        return view('app');
    }

    public function data()
    {
        try {
            $empresas = Empresa::all();
            $centrosList = Centro::with('empresa')->get();
            
            $tiposSesion = TipoSesion::with('centro', 'tiposCredito')
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

            $tiposCredito = TipoCredito::with('sesiones')->get();

            return response()->json([
                'empresas'      => $empresas,
                'centros_list'  => $centrosList,
                'tipos_sesion'  => $tiposSesion,
                'tipos_credito' => $tiposCredito,
            ]);
        } catch (\Exception $e) {
            \Log::error('GestionController@data ERROR: ' . $e->getMessage());
            return response()->json(['error' => 'Error al cargar los datos de gestión.'], 500);
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
            'google_maps_link' => 'nullable',
            'color_hex' => 'nullable|string|max:7',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'tag' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:50'
        ]);

        if (empty($data['lat']) || empty($data['lng'])) {
            [$plat, $plng] = $this->parseCoordinates($data['google_maps_link'] ?? null);
            if ($plat) $data['lat'] = $plat;
            if ($plng) $data['lng'] = $plng;
        }

        // Normalizar link: si es iframe, guardar solo el src
        if (!empty($data['google_maps_link']) && preg_match('/src="([^"]+)"/', $data['google_maps_link'], $matches)) {
            $data['google_maps_link'] = $matches[1];
        }

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
            'google_maps_link' => 'nullable',
            'color_hex' => 'nullable|string|max:7',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'tag' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:50'
        ]);

        if (empty($data['lat']) || empty($data['lng'])) {
            [$plat, $plng] = $this->parseCoordinates($data['google_maps_link'] ?? null);
            if ($plat) $data['lat'] = $plat;
            if ($plng) $data['lng'] = $plng;
        }

        // Normalizar link: si es iframe, guardar solo el src
        if (!empty($data['google_maps_link']) && preg_match('/src="([^"]+)"/', $data['google_maps_link'], $matches)) {
            $data['google_maps_link'] = $matches[1];
        }

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
