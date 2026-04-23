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
            $suscripciones = Suscripcion::with('centro')->orderBy('nombre')->get();
            $centros = Centro::orderBy('nombre')->get();

            $tipos_sesion = \App\Models\TipoSesion::where('activo', true)->orderBy('orden')->get();
            return response()->json(compact('suscripciones', 'centros', 'tipos_sesion'));
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
            'tipo_credito'          => 'required|string|max:100',
            'id_centro'             => 'nullable|exists:centros,id',
            'creditos_por_periodo'  => 'required|integer|min:1',
            'periodo'               => 'required|in:semanal,mensual',
            'limite_acumulacion'    => 'nullable|integer|min:0',
            'meses_reset'           => 'nullable|integer|min:0',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'creditos_por_periodo.min' => 'Debe haber al menos 1 crédito.',
            'periodo.in' => 'El periodo seleccionado no es válido.',
        ]);

        $suscripcion = Suscripcion::create($data);

        return response()->json(['success' => true, 'suscripcion' => $suscripcion->load('centro')], 201);
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
            'tipo_credito'          => 'required|string|max:100',
            'id_centro'             => 'nullable|exists:centros,id',
            'creditos_por_periodo'  => 'required|integer|min:1',
            'periodo'               => 'required|in:semanal,mensual',
            'limite_acumulacion'    => 'nullable|integer|min:0',
            'meses_reset'           => 'nullable|integer|min:0',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'creditos_por_periodo.min' => 'Debe haber al menos 1 crédito.',
        ]);

        $suscripcion->update($data);

        return response()->json(['success' => true, 'suscripcion' => $suscripcion->load('centro')]);
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
