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

        return view('nominas_admin.nominas_a', compact('borradores', 'historial'));
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
            // 2. Buscar sus pagos para este mes (considerando tanto entrenador_id como relación muchos a muchos)
            $pagos = Pago::where(function($q) use ($entrenador) {
                            $q->where('entrenador_id', $entrenador->id)
                              ->orWhereHas('entrenadores', fn($qq) => $qq->where('users.id', $entrenador->id));
                        })
                        ->whereMonth('fecha_registro', $mes)
                        ->whereYear('fecha_registro', $anio)
                        ->get();

            // AGRUPAR POR SESIONES ÚNICAS
            // Clave: fecha + hora + nombre clase + centro (para evitar contar sesiones duplicadas)
            $sesiones = $pagos->groupBy(function($p) {
                return $p->fecha_registro->format('Y-m-d H:i') . '|' . strtolower(trim($p->nombre_clase)) . '|' . $p->centro;
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
            
            // --- CÁLCULO SEGÚN FRANJAS (IMAGEN 1) ---
            $bruto = 0;
            $rem = $horasTrabajadas;

            // Tramo 1: < 25 horas -> 7.6 €/h
            $h1 = min($rem, 25);
            $bruto += $h1 * 7.6;
            $rem -= $h1;

            // Tramo 2: 25 - 30 horas -> 10.9 €/h
            if ($rem > 0) {
                $h2 = min($rem, 5); // Las siguientes 5 horas
                $bruto += $h2 * 10.9;
                $rem -= $h2;
            }

            // Tramo 3: > 30 horas -> 13.3 €/h
            if ($rem > 0) {
                $bruto += $rem * 13.3;
            }

            // --- DEDUCCIONES Y COSTES (IMÁGENES 1, 3 Y 4) ---
            $irpf_porcentaje = 0.00; // Por defecto 0% según imagen
            $ss_trabajador_porcentaje = 0.0635; // 6.35% según imagen
            $ss_empresa_porcentaje = 0.3140; // 31.40% según imagen

            $ss_trabajador = $bruto * $ss_trabajador_porcentaje;
            $irpf = $bruto * $irpf_porcentaje;
            $salario_neto = $bruto - $ss_trabajador - $irpf;
            
            $ss_empresa = $bruto * $ss_empresa_porcentaje;
            $coste_total = $bruto + $ss_empresa;

            // Datos para guardar en JSON
            $detalles = [
                'horas_trabajadas' => number_format($horasTrabajadas, 2, '.', ''),
                'sesiones_count' => $sesiones->count(),
                'salario_bruto' => round($bruto, 2),
                'ss_trabajador' => round($ss_trabajador, 2),
                'irpf' => round($irpf, 2),
                'salario_neto' => round($salario_neto, 2),
                'ss_empresa' => round($ss_empresa, 2),
                'coste_total' => round($coste_total, 2),
                'porcentajes' => [
                    'ss_trab' => number_format($ss_trabajador_porcentaje * 100, 2),
                    'irpf'    => number_format($irpf_porcentaje * 100, 2),
                    'ss_emp'  => number_format($ss_empresa_porcentaje * 100, 2)
                ]
            ];

            // 3. Crear o Actualizar Nómina (El importe es el NETO a percibir por el trabajador)
            $nomina = Nomina_entrenador::where('user_id', $entrenador->id)
                        ->where('mes', $mes)
                        ->where('anio', $anio)
                        ->first();

            if ($nomina) {
                if ($nomina->estado_nomina === 'pendiente_revision') {
                    $nomina->importe = $salario_neto;
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
                    'importe' => $salario_neto,
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

        // Buscar pagos del usuario para ese mes/año (considerando ambas formas de asociación)
        $pagos = Pago::where(function($q) use ($userId) {
                        $q->where('entrenador_id', $userId)
                          ->orWhereHas('entrenadores', fn($qq) => $qq->where('users.id', $userId));
                    })
                    ->whereMonth('fecha_registro', $mes)
                    ->whereYear('fecha_registro', $anio)
                    ->get();
        
        // Agrupar sesiones
        $sesiones = $pagos->groupBy(function($p) {
            return $p->fecha_registro->format('Y-m-d H:i') . '|' . strtolower(trim($p->nombre_clase)) . '|' . $p->centro;
        });

        $totalMinutos = 0;
        foreach ($sesiones as $clave => $grupoPagos) {
            $nombreClase = $grupoPagos->first()->nombre_clase;
            $claseDB = \App\Models\Clase::where('nombre', $nombreClase)->first();
            $duracion = $claseDB ? $claseDB->duracion_minutos : 60;
            $totalMinutos += $duracion;
        }

        $horasTrabajadas = $totalMinutos / 60;
        
        // Mismo cálculo por tramos para el recalcular dinámico
        $bruto = 0;
        $rem = $horasTrabajadas;
        $bruto += min($rem, 25) * 7.6;
        $rem -= min($rem, 25);
        if ($rem > 0) {
            $h2 = min($rem, 5);
            $bruto += $h2 * 10.9;
            $rem -= $h2;
        }
        if ($rem > 0) {
            $bruto += $rem * 13.3;
        }

        $ss_trab_p = 0.0635;
        $ss_emp_p = 0.3140;

        $ss_trab = $bruto * $ss_trab_p;
        $salario_neto = $bruto - $ss_trab; // IRPF 0 por ahora
        $ss_emp = $bruto * $ss_emp_p;
        $coste_total = $bruto + $ss_emp;

        $detalles = [
            'horas_trabajadas' => number_format($horasTrabajadas, 2, '.', ''),
            'sesiones_count' => $sesiones->count(),
            'salario_bruto' => round($bruto, 2),
            'ss_trabajador' => round($ss_trab, 2),
            'irpf' => 0.00,
            'salario_neto' => round($salario_neto, 2),
            'ss_empresa' => round($ss_emp, 2),
            'coste_total' => round($coste_total, 2),
            'porcentajes' => [
                'ss_trab' => $ss_trab_p * 100,
                'irpf'    => 0,
                'ss_emp'  => $ss_emp_p * 100
            ]
        ];

        return response()->json([
            'importe' => round($salario_neto, 2),
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
            'user_id' => 'required|exists:users,id',
            'salario_bruto' => 'nullable|numeric',
            'ss_trabajador' => 'nullable|numeric',
            'irpf' => 'nullable|numeric',
            'ss_empresa' => 'nullable|numeric',
            'coste_total' => 'nullable|numeric',
            'horas_trabajadas' => 'nullable|numeric',
            'extra_conceptos' => 'nullable|array',
            'extra_importes' => 'nullable|array',
        ]);

        $nomina->importe = $request->importe;
        $nomina->user_id = $request->user_id;

        // ACTUALIZAR DESGLOSE DETALLADO
        $detalles = $nomina->detalles ?? [];
        
        // Capturar valores del formulario si están presentes
        if ($request->has('salario_bruto')) {
            $detalles['salario_bruto'] = $request->salario_bruto;
        }
        if ($request->has('ss_trabajador')) {
            $detalles['ss_trabajador'] = $request->ss_trabajador;
        }
        if ($request->has('irpf')) {
            $detalles['irpf'] = $request->irpf;
        }
        if ($request->has('ss_empresa')) {
            $detalles['ss_empresa'] = $request->ss_empresa;
        }
        if ($request->has('coste_total')) {
            $detalles['coste_total'] = $request->coste_total;
        }
        if ($request->has('horas_trabajadas')) {
            $detalles['horas_trabajadas'] = $request->horas_trabajadas;
        }
        
        // Manejo de Extras (Concepto + Importe)
        // Se espera un array de 'extra_conceptos' y 'extra_importes'
        if ($request->has('extra_conceptos')) {
            $extras = [];
            foreach ($request->extra_conceptos as $index => $concepto) {
                if (!empty($concepto)) {
                    $extras[] = [
                        'concepto' => $concepto,
                        'importe' => $request->extra_importes[$index] ?? 0
                    ];
                }
            }
            $detalles['extras'] = $extras;
        } else {
            $detalles['extras'] = [];
        }

        $nomina->detalles = $detalles;
        $nomina->save();

        // Subida de PDF
        if ($request->hasFile('archivo')) {
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
