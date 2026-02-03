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

        // 1. Obtener TODOS los entrenadores
        $entrenadores = User::role('entrenador')->get();

        $generadas = 0;
        $actualizadas = 0;

        foreach ($entrenadores as $entrenador) {
            // 2. Buscar sus pagos COMPLETED (fecha < now) para este mes
            $pagos = Pago::where('entrenador_id', $entrenador->id)
                        ->whereMonth('fecha_registro', $mes)
                        ->whereYear('fecha_registro', $anio)
                        ->where('fecha_registro', '<', now())
                        ->get();

            // AGRUPAR POR SESIONES ÚNICAS
            // Clave: fecha + hora + nombre clase (para evitar contar alumnos duplicados como horas extra)
            $sesiones = $pagos->groupBy(function($p) {
                return $p->fecha_registro->format('Y-m-d H:i') . '|' . strtolower(trim($p->nombre_clase));
            });

            $totalMinutos = 0;
            
            foreach ($sesiones as $clave => $grupoPagos) {
                // Tomamos el nombre de clase del primer pago del grupo
                $nombreClase = $grupoPagos->first()->nombre_clase;
                
                // Buscar duración en modelo Clase (aproximación por nombre)
                $claseDB = \App\Models\Clase::where('nombre', $nombreClase)->first();
                $duracion = $claseDB ? $claseDB->duracion_minutos : 60; // Default 1h si no encuentra
                
                $totalMinutos += $duracion;
            }

            $horasTrabajadas = $totalMinutos / 60;
            $precioHora = $entrenador->precio_hora > 0 ? $entrenador->precio_hora : 0; // Si no tiene, 0

            $totalEntrenador = $horasTrabajadas * $precioHora;

            // Datos para guardar en JSON
            $detalles = [
                'horas_trabajadas' => number_format($horasTrabajadas, 2),
                'precio_hora' => $precioHora,
                'sesiones_count' => $sesiones->count(),
                'total_recaudado' => $pagos->sum('importe'), // Informativo
                'cantidad_pagos' => $pagos->count()
            ];

            // 3. Crear o Actualizar Nómina
            $nomina = Nomina_entrenador::where('user_id', $entrenador->id)
                        ->where('mes', $mes)
                        ->where('anio', $anio)
                        ->first();

            if ($nomina) {
                if ($nomina->estado_nomina === 'pendiente_revision') {
                    $nomina->importe = $totalEntrenador;
                    $nomina->detalles = $detalles;
                    $nomina->save();
                    $actualizadas++;
                }
            } else {
                Nomina_entrenador::create([
                    'user_id' => $entrenador->id,
                    'mes' => $mes,
                    'anio' => $anio,
                    'concepto' => 'Nómina ' . $this->getNombreMes($mes),
                    'importe' => $totalEntrenador,
                    'estado_nomina' => 'pendiente_revision',
                    'es_auto_generada' => true,
                    'detalles' => $detalles
                ]);
                $generadas++;
            }
        }

        return back()->with('success', "Proceso finalizado: $generadas nóminas creadas y $actualizadas actualizadas para el mes $mes/$anio.");
    }

    // CALCULAR NÓMINA DINÁMICA
    public function calcularNomina(Request $request, $userId)
    {
        $mes = $request->input('mes', date('n'));
        $anio = $request->input('anio', date('Y'));
        
        $entrenador = User::find($userId);

        // Buscar pagos del usuario para ese mes/año
        $pagos = Pago::where('entrenador_id', $userId)
                    ->whereMonth('fecha_registro', $mes)
                    ->whereYear('fecha_registro', $anio)
                    ->where('fecha_registro', '<', now())
                    ->get();
        
        // Agrupar sesiones
        $sesiones = $pagos->groupBy(function($p) {
            return $p->fecha_registro->format('Y-m-d H:i') . '|' . strtolower(trim($p->nombre_clase));
        });

        $totalMinutos = 0;
        foreach ($sesiones as $clave => $grupoPagos) {
            $nombreClase = $grupoPagos->first()->nombre_clase;
            $claseDB = \App\Models\Clase::where('nombre', $nombreClase)->first();
            $duracion = $claseDB ? $claseDB->duracion_minutos : 60;
            $totalMinutos += $duracion;
        }

        $horasTrabajadas = $totalMinutos / 60;
        
        // Si viene un precio en el request (ej: editado en modal), usarlo. Si no, el de la DB.
        $precioHora = $request->input('precio_hora') ? floatval($request->input('precio_hora')) : ($entrenador->precio_hora ?? 0);

        $totalEntrenador = $horasTrabajadas * $precioHora;

        $detalles = [
            'horas_trabajadas' => number_format($horasTrabajadas, 2),
            'precio_hora' => $precioHora,
            'sesiones_count' => $sesiones->count(),
            'total_recaudado' => $pagos->sum('importe'),
            'cantidad_pagos' => $pagos->count()
        ];

        return response()->json([
            'importe' => $totalEntrenador,
            'detalles' => $detalles
        ]);
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

        // ACTUALIZAR DETALLES CON LOS VALORES MANUALES
        $detalles = $nomina->detalles ?? [];
        // Si vienen en el request (que deberían si están en el form)
        if($request->has('precio_hora')) {
            $detalles['precio_hora'] = $request->precio_hora;
        }
        if($request->has('horas_trabajadas')) {
            $detalles['horas_trabajadas'] = $request->horas_trabajadas;
        }
        $nomina->detalles = $detalles;

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
    
    // PAGAR (Marcar como pagado)
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
