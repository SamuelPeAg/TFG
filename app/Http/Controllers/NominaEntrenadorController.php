<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nomina_entrenador;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // Para descargar archivos

class NominaEntrenadorController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        if (!$userId) {
            return redirect()->route('login');
        }

        // 1. Obtenemos TODAS las nóminas del usuario (para la tabla y el select)
        $nominas_e = Nomina_entrenador::where('user_id', $userId)
                                ->orderBy('anio', 'desc')
                                ->orderBy('mes', 'desc')
                                ->get();

        // 2. Lógica del FILTRO:
        // Si el usuario eligió una en el desplegable (?nomina_id=5), buscamos esa.
        // Si no, mostramos la primera de la lista (la más reciente).
        $nominaSeleccionada = $nominas_e->first();

        if ($request->has('nomina_id')) {
            $busqueda = $nominas_e->where('id', $request->nomina_id)->first();
            // Verificamos que exista y sea suya (seguridad)
            if ($busqueda) {
                $nominaSeleccionada = $busqueda;
            }
        }

        return view('nominas_entrenador.nominas_e', compact('nominas_e', 'nominaSeleccionada'));
    }

    // --- NUEVA FUNCIONALIDAD: DESCARGAR PDF ---
    public function descargar($id)
    {
        // Buscamos la nómina y verificamos que sea del usuario conectado (Seguridad)
        $nomina = Nomina_entrenador::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->firstOrFail();

        // Verificamos si el archivo existe en la carpeta storage
        // Nota: Como estamos usando datos falsos (Seeders), el archivo no existirá de verdad.
        // En una app real, usaríamos: return Storage::download($nomina->archivo_path);
        
        // PARA TU PROYECTO AHORA MISMO:
        // Vamos a simular la descarga o redirigir a un PDF de prueba si tienes uno.
        // Si quieres probarlo, crea un archivo "demo.pdf" en "public/nominas/"
        
        $rutaArchivo = public_path($nomina->archivo_path);
        
        if (file_exists($rutaArchivo)) {
            return response()->download($rutaArchivo);
        } else {
            return back()->with('error', 'El archivo PDF no se encuentra en el servidor (es un dato de prueba).');
        }
    }
}