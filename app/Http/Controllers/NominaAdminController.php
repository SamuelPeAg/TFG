<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nomina_entrenador;
use App\Models\User;
use App\Models\Pago;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class NominaAdminController extends Controller
{
    // MOSTRAR EL PANEL
    public function index()
    {
        // Nóminas Pendientes de Revisión (Borradores)
        $borradores = Nomina_entrenador::where('estado_nomina', 'pendiente_revision')
                        ->with('user')
                        ->orderBy('user_id')
                        ->get();

        // Historial (Confirmadas o Pagadas)
        $historial = Nomina_entrenador::where('estado_nomina', '!=', 'pendiente_revision')
                        ->with('user')
                        ->orderBy('created_at', 'desc')
                        ->get();

        $entrenadores = User::role('entrenador')->orderBy('name')->get();

        return view('nominas_admin.nominas_a', compact('borradores', 'historial', 'entrenadores'));
    }

    // GENERAR BORRADORES (AUTO)
    public function generar(Request $request)
    {
        $mes = $request->input('mes', date('n'));
        $anio = $request->input('anio', date('Y'));

        // 1. Buscar pagos de ese mes/año agrupados por entrenador
        $pagosPorEntrenador = Pago::whereMonth('fecha_registro', $mes)
                                ->whereYear('fecha_registro', $anio)
                                ->get()
                                ->groupBy('entrenador_id');

        $generadas = 0;

        foreach ($pagosPorEntrenador as $entrenadorId => $pagos) {
            // Verificar si ya existe nómina para este entrenador/mes/año
            $existe = Nomina_entrenador::where('user_id', $entrenadorId)
                        ->where('mes', $mes)
                        ->where('anio', $anio)
                        ->exists();

            if (!$existe) {
                $total = $pagos->sum('importe');

                Nomina_entrenador::create([
                    'user_id' => $entrenadorId,
                    'mes' => $mes,
                    'anio' => $anio,
                    'concepto' => 'Nómina ' . $this->getNombreMes($mes),
                    'importe' => $total,
                    'estado_nomina' => 'pendiente_revision',
                    'es_auto_generada' => true,
                ]);

                $generadas++;
            }
        }

        return back()->with('success', "Se han generado $generadas borradores de nóminas para el mes $mes/$anio.");
    }

    // ACTUALIZAR (CONFIRMAR O EDITAR)
    public function update(Request $request, $id)
    {
        $nomina = Nomina_entrenador::findOrFail($id);

        $request->validate([
            'importe' => 'required|numeric',
            'accion' => 'required|in:guardar,confirmar',
            'archivo' => 'nullable|file|mimes:pdf|max:2048',
            'user_id' => 'required|exists:users,id'
        ]);

        $nomina->importe = $request->importe;
        $nomina->user_id = $request->user_id; // Actualizar entrenador asignado

        // Subida de PDF
        if ($request->hasFile('archivo')) {
            // Borrar anterior si existe
            if ($nomina->archivo_path && Storage::disk('public')->exists($nomina->archivo_path)) {
                Storage::disk('public')->delete($nomina->archivo_path);
            }
            $path = $request->file('archivo')->store('nominas', 'public');
            $nomina->archivo_path = $path;
        }

        if ($request->accion == 'confirmar') {
            $nomina->estado_nomina = 'pendiente_pago'; // Pasa a visible para el entrenador
            $mensaje = 'Nómina confirmada y publicada.';
        } else {
            $mensaje = 'Borrador actualizado.';
        }

        $nomina->save();

        return back()->with('success', $mensaje);
    }
    
    // PAGAR (Marcar como pagado) - Opcional, si queremos botón de "Marcar Pagado"
    public function marcarPagado($id)
    {
         $nomina = Nomina_entrenador::findOrFail($id);
         $nomina->estado_nomina = 'pagado';
         $nomina->fecha_pago = now();
         $nomina->save();
         
         return back()->with('success', 'Nómina marcada como PAGADA.');
    }

    // ELIMINAR
    public function destroy($id)
    {
        $nomina = Nomina_entrenador::findOrFail($id);
        if ($nomina->archivo_path && Storage::disk('public')->exists($nomina->archivo_path)) {
            Storage::disk('public')->delete($nomina->archivo_path);
        }
        $nomina->delete();
        return back()->with('success', 'Nómina eliminada.');
    }
    
    private function getNombreMes($numero) {
        $meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        return $meses[$numero - 1] ?? 'Mes';
    }
}
