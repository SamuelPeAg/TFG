<?php

namespace App\Http\Controllers;

use App\Models\Nomina;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NominaController extends Controller
{
    /**
     * Muestra la vista con la lista de nóminas y usuarios.
     */
    public function index()
    {
        // Traemos las nóminas ordenadas por fecha (más nuevas primero)
        // Usamos 'with' para cargar los datos del usuario y optimizar la consulta
        $nominas = Nomina::with('user')->orderBy('fecha_emision', 'desc')->get();
        
        // Traemos los usuarios para el desplegable (Select)
        // Puedes filtrar por rol si quieres: User::role('entrenador')->get();
        $users = User::all();

        // Asegúrate de que el nombre de la vista coincida con tu archivo blade
        return view('gestionar_nominas', compact('nominas', 'users'));
    }

    /**
     * Guarda una nueva nómina y sube el archivo.
     */
    public function store(Request $request)
    {
        // 1. Validamos los datos
        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'fecha_emision' => 'required|date',
            'importe'       => 'required|numeric',
            'archivo'       => 'required|file|mimes:pdf|max:5120', // Máximo 5MB, solo PDF
            'concepto'      => 'nullable|string|max:255',
        ]);

        try {
            // 2. Subimos el archivo
            // Se guardará en storage/app/public/nominas
            $path = null;
            if ($request->hasFile('archivo')) {
                $path = $request->file('archivo')->store('nominas', 'public');
            }

            // 3. Creamos el registro en la base de datos
            Nomina::create([
                'user_id'       => $request->user_id,
                'fecha_emision' => $request->fecha_emision,
                'importe'       => $request->importe,
                'concepto'      => $request->concepto,
                'archivo_path'  => $path,
            ]);

            return redirect()->route('nominas.nominas')
                ->with('success', 'Nómina subida correctamente.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Hubo un error al subir la nómina: ' . $e->getMessage()]);
        }
    }

    /**
     * Actualiza la nómina (y reemplaza el archivo si se sube uno nuevo).
     */
    public function update(Request $request, $id)
    {
        $nomina = Nomina::findOrFail($id);

        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'fecha_emision' => 'required|date',
            'importe'       => 'required|numeric',
            'archivo'       => 'nullable|file|mimes:pdf|max:5120', // Opcional al editar
            'concepto'      => 'nullable|string|max:255',
        ]);

        try {
            // 1. Manejo del archivo (si subieron uno nuevo)
            if ($request->hasFile('archivo')) {
                
                // Borrar el archivo viejo si existe para no ocupar espacio
                if ($nomina->archivo_path && Storage::disk('public')->exists($nomina->archivo_path)) {
                    Storage::disk('public')->delete($nomina->archivo_path);
                }

                // Subir el nuevo
                $path = $request->file('archivo')->store('nominas', 'public');
                $nomina->archivo_path = $path;
            }

            // 2. Actualizar datos de texto
            $nomina->user_id       = $request->user_id;
            $nomina->fecha_emision = $request->fecha_emision;
            $nomina->importe       = $request->importe;
            $nomina->concepto      = $request->concepto;
            
            $nomina->save();

            return redirect()->route('nominas.nominas')
                ->with('success', 'Nómina actualizada correctamente.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al actualizar: ' . $e->getMessage()]);
        }
    }

    /**
     * Elimina la nómina y su archivo físico.
     */
    public function destroy($id)
    {
        $nomina = Nomina::findOrFail($id);

        // 1. Eliminar el archivo PDF del disco
        if ($nomina->archivo_path && Storage::disk('public')->exists($nomina->archivo_path)) {
            Storage::disk('public')->delete($nomina->archivo_path);
        }

        // 2. Eliminar registro de la BD
        $nomina->delete();

        return redirect()->route('nominas.nominas')
            ->with('success', 'Nómina eliminada correctamente.');
    }
}