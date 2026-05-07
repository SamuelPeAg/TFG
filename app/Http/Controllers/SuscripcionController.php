<?php

namespace App\Http\Controllers;

use App\Models\Suscripcion;
use App\Models\Centro;
use Illuminate\Http\Request;

class SuscripcionController extends Controller
{
    /**
     * GET /suscripciones
     * Returns paginated list + centros for the React view.
     */
    public function index(Request $request)
    {
        if ($request->wantsJson() || $request->ajax()) {
            $suscripciones = Suscripcion::with(['centro', 'creditos'])->orderBy('nombre')->get();
            $centros = Centro::orderBy('nombre')->get();

            $tipos_sesion = \App\Models\TipoSesion::where('activo', true)->orderBy('orden')->get();
            $tipos_credito = \App\Models\TipoCredito::with('sesiones')->orderBy('nombre')->get();
            return response()->json(compact('suscripciones', 'centros', 'tipos_sesion', 'tipos_credito'));
        }
        

        return view('app');
    }

    /**
     * POST /suscripciones
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'                => 'required|string|max:255',
            'precio'                => 'required|numeric|min:0',
            'id_centro'             => 'nullable|exists:centros,id',
            'periodo'               => 'required|in:semanal,mensual',
            'limite_acumulacion'    => 'nullable|integer|min:0',
            'meses_reset'           => 'nullable|integer|min:0',
            'creditos'              => 'required|array|min:1',
            'creditos.*.tipo_credito_id' => 'required|exists:tipos_credito,id',
            'creditos.*.cantidad'   => 'required|integer|min:1',
            'creditos.*.dias_caducidad' => 'required|integer|min:0',
            'domiciliacion'         => 'nullable|boolean',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'creditos.required' => 'Debe añadir al menos una línea de crédito.',
            'periodo.in' => 'El periodo seleccionado no es válido.',
        ]);

        $suscripcion = Suscripcion::create([
            'nombre' => $data['nombre'],
            'precio' => $data['precio'],
            'id_centro' => $data['id_centro'] ?? null,
            'periodo' => $data['periodo'],
            'limite_acumulacion' => $data['limite_acumulacion'] ?? 0,
            'meses_reset' => $data['meses_reset'] ?? 1,
            'domiciliacion' => $data['domiciliacion'] ?? false,
        ]);

        foreach ($data['creditos'] as $credito) {
            $suscripcion->creditos()->create($credito);
        }

        return response()->json(['success' => true, 'suscripcion' => $suscripcion->load(['centro', 'creditos'])], 201);
    }

    /**
     * PUT /suscripciones/{id}
     */
    public function update(Request $request, $id)
    {
        $suscripcion = Suscripcion::findOrFail($id);

        $data = $request->validate([
            'nombre'                => 'required|string|max:255',
            'precio'                => 'required|numeric|min:0',
            'id_centro'             => 'nullable|exists:centros,id',
            'periodo'               => 'required|in:semanal,mensual',
            'limite_acumulacion'    => 'nullable|integer|min:0',
            'meses_reset'           => 'nullable|integer|min:0',
            'creditos'              => 'required|array|min:1',
            'creditos.*.tipo_credito_id' => 'required|exists:tipos_credito,id',
            'creditos.*.cantidad'   => 'required|integer|min:1',
            'creditos.*.dias_caducidad' => 'required|integer|min:0',
            'domiciliacion'         => 'nullable|boolean',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'creditos.required' => 'Debe añadir al menos una línea de crédito.',
        ]);

        $suscripcion->update([
            'nombre' => $data['nombre'],
            'precio' => $data['precio'],
            'id_centro' => $data['id_centro'] ?? null,
            'periodo' => $data['periodo'],
            'limite_acumulacion' => $data['limite_acumulacion'] ?? 0,
            'meses_reset' => $data['meses_reset'] ?? 1,
            'domiciliacion' => $data['domiciliacion'] ?? false,
        ]);

        $suscripcion->creditos()->delete();
        foreach ($data['creditos'] as $credito) {
            $suscripcion->creditos()->create($credito);
        }

        return response()->json(['success' => true, 'suscripcion' => $suscripcion->load(['centro', 'creditos'])]);
    }

    /**
     * DELETE /suscripciones/{id}
     */
    public function destroy($id)
    {
        $suscripcion = Suscripcion::findOrFail($id);
        $suscripcion->delete();

        return response()->json(['success' => true]);
    }
}
