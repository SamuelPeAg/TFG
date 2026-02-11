<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nomina_entrenador;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class NominaPdfController extends Controller
{
    /**
     * Vista previa del PDF en el navegador.
     */
    public function preview($id)
    {
        $nomina = Nomina_entrenador::with('user')->findOrFail($id);

        // Seguridad: Solo admin o el propio entrenador
        if (!Auth::user()->hasRole('admin') && Auth::id() !== $nomina->user_id) {
            abort(403);
        }

        $pdf = $this->generatePdf($nomina);
        
        return $pdf->stream("nomina_{$nomina->mes}_{$nomina->anio}.pdf");
    }

    /**
     * Descarga del PDF.
     */
    public function download($id)
    {
        $nomina = Nomina_entrenador::with('user')->findOrFail($id);

        if (!Auth::user()->hasRole('admin') && Auth::id() !== $nomina->user_id) {
            abort(403);
        }

        $pdf = $this->generatePdf($nomina);
        
        return $pdf->download("nomina_{$nomina->user->name}_{$nomina->mes}_{$nomina->anio}.pdf");
    }

    /**
     * Lógica común para generar el objeto PDF.
     */
    private function generatePdf($nomina)
    {
        $data = [
            'nomina' => $nomina,
            'user' => $nomina->user,
            'detalles' => $nomina->detalles,
            'mes_nombre' => $this->getNombreMes($nomina->mes)
        ];

        return Pdf::loadView('nominas.pdf_nomina', $data);
    }

    private function getNombreMes($numero)
    {
        $meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        return $meses[$numero - 1] ?? 'Mes';
    }
}
