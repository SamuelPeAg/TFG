<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nomina_entrenador;
use Illuminate\Support\Facades\Auth;

class NominaEntrenadorController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        if ($request->wantsJson() || $request->ajax()) {
            $nominas = Nomina_entrenador::where('user_id', $userId)
                ->where('estado_nomina', '!=', 'pendiente_revision') // No mostrar borradores al entrenador
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($nominas);
        }

        return view('app');
    }

    public function descargar($id)
    {
        $nomina = Nomina_entrenador::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->firstOrFail();

        // Lógica de descarga (si existe archivo)
        // Si es auto-generada sin archivo, quizás generar PDF al vuelo o mostrar error
        
        $ruta = $nomina->archivo_path ? public_path('storage/' . $nomina->archivo_path) : null;

        if ($ruta && file_exists($ruta)) {
            return response()->download($ruta);
        } else {
            return back()->with('error', 'El documento PDF no está disponible para esta nómina.');
        }
    }
}
