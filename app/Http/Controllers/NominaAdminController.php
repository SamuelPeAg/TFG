<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nomina_entrenador;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class NominaAdminController extends Controller
{
    // MOSTRAR EL PANEL
    public function index()
    {
        // Traemos los usuarios para el desplegable
        $entrenadores = User::all();
        
        // Traemos el historial ordenado
        $historial = Nomina_entrenador::with('user')
                        ->orderBy('created_at', 'desc')
                        ->get();

        return view('nominas_admin.nominas_a', compact('entrenadores', 'historial'));
    }

    // GUARDAR (SUBIR PDF)
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'mes'     => 'required|numeric',
            'anio'    => 'required|numeric',
            'importe' => 'required|numeric',
            'archivo' => 'required|mimes:pdf|max:5000', // Máximo 5MB
        ]);

        try {
            // 1. Subir archivo
            $ruta = $request->file('archivo')->store('nominas', 'public');

            // 2. Crear registro (Usando los campos de tu migración)
            Nomina_entrenador::create([
                'user_id'      => $request->user_id,
                'mes'          => $request->mes,
                'anio'         => $request->anio,
                'concepto'     => $request->concepto ?? 'Nómina Mensual',
                'importe'      => $request->importe,
                'estado'       => 'pagado',
                'fecha_pago'   => now(),
                'archivo_path' => $ruta,
            ]);

            return back()->with('success', 'Nómina subida correctamente.');

        } catch (\Exception $e) {
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    // ELIMINAR
    public function destroy($id)
    {
        $nomina = Nomina_entrenador::findOrFail($id);

        // Borrar archivo físico si existe
        if ($nomina->archivo_path && Storage::disk('public')->exists($nomina->archivo_path)) {
            Storage::disk('public')->delete($nomina->archivo_path);
        }

        $nomina->delete();

        return back()->with('success', 'Nómina eliminada.');
    }
}