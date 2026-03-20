<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Centro;
use Illuminate\Http\Request;

class CentroManagementController extends Controller
{
    /**
     * Almacena un nuevo centro en la base de datos.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:centros,nombre',
            'descripcion' => 'nullable|string',
            'direccion' => 'nullable|string|max:255',
            'google_maps_link' => 'nullable|url|max:1000',
        ], [
            'nombre.required' => 'El nombre del centro es obligatorio.',
            'nombre.unique' => 'Ya existe un centro con ese nombre.',
            'google_maps_link.url' => 'El link de Google Maps debe ser una URL válida.',
        ]);

        try {
            Centro::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'direccion' => $request->direccion ?? $request->descripcion, // Usar descripcion como direccion por defecto si no se provee
                'google_maps_link' => $request->google_maps_link,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Centro añadido correctamente.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al añadir el centro: ' . $e->getMessage()
            ], 500);
        }
    }
}
