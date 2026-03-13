<?php

namespace App\Http\Controllers;

use App\Models\Suscripcion;
use App\Models\Centro;
use Illuminate\Http\Request;

class SuscripcionController extends Controller
{
    public function index()
    {
        $suscripciones = Suscripcion::with('centro')->get();
        $centros = Centro::all();
        $tipos_permitidos = ['ep', 'duo', 'trio', 'Grupo', 'Grupo especial'];
        return view('suscripciones.index', compact('suscripciones', 'centros', 'tipos_permitidos'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo_credito' => 'required|in:ep,duo,trio,Grupo,Grupo especial',
            'id_centro' => 'nullable|exists:centros,id',
            'creditos_por_periodo' => 'required|integer|min:1',
            'periodo' => 'required|in:semanal,mensual',
            'limite_acumulacion' => 'nullable|integer|min:0',
            'meses_reset' => 'nullable|integer|min:1|max:12',
        ]);

        Suscripcion::create($validated);

        return redirect()->route('suscripciones.index')->with('success', 'Suscripción creada correctamente');
    }

    public function update(Request $request, Suscripcion $suscripcion)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo_credito' => 'required|in:ep,duo,trio,Grupo,Grupo especial',
            'id_centro' => 'nullable|exists:centros,id',
            'creditos_por_periodo' => 'required|integer|min:1',
            'periodo' => 'required|in:semanal,mensual',
            'limite_acumulacion' => 'nullable|integer|min:0',
            'meses_reset' => 'nullable|integer|min:1|max:12',
        ]);

        $suscripcion->update($validated);

        return redirect()->route('suscripciones.index')->with('success', 'Suscripción actualizada correctamente');
    }

    public function destroy(Suscripcion $suscripcion)
    {
        $suscripcion->delete();
        return redirect()->route('suscripciones.index')->with('success', 'Suscripción eliminada correctamente');
    }
}
