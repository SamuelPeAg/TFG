<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Nomina_entrenador;
use App\Models\Entrenador;
use App\Models\Pago;
use Carbon\Carbon;

class NominaSeeder extends Seeder
{
    public function run()
    {
        // Buscar al entrenador por email (se crea en RoleSeeder)
        $entrenador = Entrenador::where('email', 'entrenador@factomove')->first();

        if (!$entrenador) {
            // Si no existe, buscamos el primero disponible
            $entrenador = Entrenador::first();
        }

        if (!$entrenador) {
            $this->command->error('No se encontró ningún entrenador para asignar nóminas.');
            return;
        }

        // Limpiar nóminas previas para este entrenador para evitar duplicados en pruebas
        Nomina_entrenador::where('entrenador_id', $entrenador->id)->delete();

        $fechaActual = Carbon::now();

        // 1. Nómina del mes ACTUAL (Pendiente de Pago)
        Nomina_entrenador::create([
            'entrenador_id' => $entrenador->id,
            'mes' => $fechaActual->month,
            'anio' => $fechaActual->year,
            'concepto' => 'Nómina ' . $this->getNombreMes($fechaActual->month) . ' ' . $fechaActual->year,
            'importe' => rand(1200, 1800) + (rand(0, 99) / 100),
            'estado_nomina' => 'pendiente_pago',
            'es_auto_generada' => true,
            'detalles' => [
                'horas_trabajadas' => rand(120, 160),
                'salario_bruto' => 1800,
                'ss_trabajador' => 114.30,
                'irpf' => 0,
                'salario_neto' => 1685.70,
                'ss_empresa' => 565.20,
                'coste_total' => 2365.20,
                'porcentajes' => ['ss_trab' => '6.35', 'irpf' => '0', 'ss_emp' => '31.40']
            ]
        ]);

        // 2. Nóminas de los 5 meses ANTERIORES (Pagadas)
        for ($i = 1; $i <= 5; $i++) {
            $fechaPasada = Carbon::now()->subMonths($i);
            
            Nomina_entrenador::create([
                'entrenador_id' => $entrenador->id,
                'mes' => $fechaPasada->month,
                'anio' => $fechaPasada->year,
                'concepto' => 'Nómina ' . $this->getNombreMes($fechaPasada->month) . ' ' . $fechaPasada->year,
                'importe' => rand(1200, 1800) + (rand(0, 99) / 100),
                'estado_nomina' => 'pagado',
                'fecha_pago' => $fechaPasada->copy()->addDays(5),
                'es_auto_generada' => true,
                'detalles' => [
                    'horas_trabajadas' => rand(120, 160),
                    'salario_bruto' => 1800,
                    'ss_trabajador' => 114.30,
                    'irpf' => 0,
                    'salario_neto' => 1685.70,
                    'ss_empresa' => 565.20,
                    'coste_total' => 2365.20,
                    'porcentajes' => ['ss_trab' => '6.35', 'irpf' => '0', 'ss_emp' => '31.40']
                ]
            ]);
        }

        $this->command->info('Nóminas generadas correctamente para ' . $entrenador->email);
    }

    private function getNombreMes($mes) {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril', 
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto', 
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];
        return $meses[$mes] ?? '';
    }
}
