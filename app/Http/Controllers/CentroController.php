<?php

namespace App\Http\Controllers;

use App\Models\Centro;
use Illuminate\Http\Request;

class CentroController extends Controller
{
    /**
     * Muestra la lista de centros.
     */
    public function index()
    {
        $centros = Centro::all();
        return view('centros.index', compact('centros'));
    }

    /**
     * Almacena un nuevo centro en la base de datos.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'           => 'required|string|max:255',
            'direccion'        => 'required|string|max:255',
            'google_maps_link' => 'nullable|string', // Puede ser null
        ]);

        Centro::create($validated);

        return redirect()->route('centros.index')
            ->with('success', 'Centro creado correctamente.');
    }

    /**
     * Actualiza un centro existente.
     */
    public function update(Request $request, $id)
    {
        $centro = Centro::findOrFail($id);

        $validated = $request->validate([
            'nombre'           => 'required|string|max:255',
            'direccion'        => 'required|string|max:255',
            'google_maps_link' => 'nullable|string',
        ]);

        $centro->update($validated);

        return redirect()->route('centros.index')
            ->with('success', 'Centro actualizado correctamente.');
    }

    /**
     * Elimina un centro.
     */
    public function destroy($id)
    {
        $centro = Centro::findOrFail($id);
        $centro->delete();

        return redirect()->route('centros.index')
            ->with('success', 'Centro eliminado correctamente.');
    }
}
