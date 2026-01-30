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

        // Filtro: 'pendiente' (por defecto) o 'pagado'
        // 'pendiente' muestra las que están en estado 'pendiente_pago' (confirmadas por admin)
        // 'pagado' muestra las que están 'pagado'
        $filtro = $request->input('estado', 'pendiente');

        $query = Nomina_entrenador::where('user_id', $userId);

        if ($filtro == 'pagado') {
            $query->where('estado_nomina', 'pagado');
        } else {
            // Por defecto mostramos las pendientes de pago (confirmadas)
            // NO mostramos borradores ('pendiente_revision')
            $query->where('estado_nomina', 'pendiente_pago');
        }

        $nominas = $query->orderBy('created_at', 'desc')->get();

        return view('nominas_entrenador.nominas_e', compact('nominas', 'filtro'));
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
