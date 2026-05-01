<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\TipoCredito;

class TipoCreditoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'id_centro' => 'nullable|exists:centros,id',
            'sesiones' => 'required|array|min:1',
            'sesiones.*' => 'exists:tipos_sesion,id'
        ]);

        $tipo = TipoCredito::create([
            'nombre' => $validated['nombre'],
            'id_centro' => $validated['id_centro']
        ]);

        $tipo->sesiones()->sync($validated['sesiones']);

        return response()->json(['success' => true]);
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoCredito::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'id_centro' => 'nullable|exists:centros,id',
            'sesiones' => 'required|array|min:1',
            'sesiones.*' => 'exists:tipos_sesion,id'
        ]);

        $tipo->update([
            'nombre' => $validated['nombre'],
            'id_centro' => $validated['id_centro']
        ]);

        $tipo->sesiones()->sync($validated['sesiones']);

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $tipo = TipoCredito::findOrFail($id);
        $tipo->delete();
        return response()->json(['success' => true]);
    }
}
