<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Nomina_entrenador;
use App\Models\User;
use Carbon\Carbon;

class NominaSeeder extends Seeder
{
    public function run()
    {
        // Buscar al entrenador
        $entrenador = User::where('email', 'entrenador@factomove')->first();

        if (!$entrenador) {
            $this->command->error('No se encontró el usuario entrenador@factomove');
            return;
        }

        // 1. Nómina del mes ACTUAL (Pendiente de cobro)
        // Buscamos los pagos REALES que ya haya generado el PagoSeeder (o que existan en BD)
        $fechaActual = Carbon::now();
        
        $totalPagosActual = \App\Models\Pago::where('entrenador_id', $entrenador->id)
                            ->whereMonth('fecha_registro', $fechaActual->month)
                            ->whereYear('fecha_registro', $fechaActual->year)
                            ->sum('importe');

        // Si no hay pagos, creamos algunos para que no salga a 0
        if ($totalPagosActual == 0) {
            $this->crearPagosSimulados($entrenador, $fechaActual);
            $totalPagosActual = \App\Models\Pago::where('entrenador_id', $entrenador->id)
                                ->whereMonth('fecha_registro', $fechaActual->month)
                                ->whereYear('fecha_registro', $fechaActual->year)
                                ->sum('importe');
        }

        Nomina_entrenador::create([
            'user_id' => $entrenador->id,
            'mes' => $fechaActual->month,
            'anio' => $fechaActual->year,
            'concepto' => 'Nómina ' . $this->getNombreMes($fechaActual->month) . ' ' . $fechaActual->year,
            'importe' => $totalPagosActual, // AHORA SÍ CUADRA
            'estado_nomina' => 'pendiente_pago',
            'es_auto_generada' => true,
            'created_at' => $fechaActual,
        ]);

        // 2. 3 Nóminas ANTERIORES (Pagadas)
        for ($i = 1; $i <= 3; $i++) {
            $fechaPasada = Carbon::now()->subMonths($i);
            
            // Primero creamos los PAGOS para ese mes pasado, para que cuadre si se mira el historial
            $this->crearPagosSimulados($entrenador, $fechaPasada);

            // Calculamos el total
            $totalMesPasado = \App\Models\Pago::where('entrenador_id', $entrenador->id)
                                ->whereMonth('fecha_registro', $fechaPasada->month)
                                ->whereYear('fecha_registro', $fechaPasada->year)
                                ->sum('importe');

            Nomina_entrenador::create([
                'user_id' => $entrenador->id,
                'mes' => $fechaPasada->month,
                'anio' => $fechaPasada->year,
                'concepto' => 'Nómina ' . $this->getNombreMes($fechaPasada->month) . ' ' . $fechaPasada->year,
                'importe' => $totalMesPasado, // Total real de los pagos generados
                'estado_nomina' => 'pagado',
                'fecha_pago' => $fechaPasada->copy()->endOfMonth(),
                'es_auto_generada' => true,
                'created_at' => $fechaPasada,
            ]);
        }
    }

    private function crearPagosSimulados($user, $fechaBase)
    {
        // Generar entre 3 y 8 pagos aleatorios para ese mes
        $cantidad = rand(3, 8);
        
        for ($k = 0; $k < $cantidad; $k++) {
            // Generar IBAN seguro concatenando partes para evitar overflow en rand()
            $iban = 'ES' . str_pad(rand(0, 9999999999), 10, '0', STR_PAD_LEFT) . str_pad(rand(0, 9999999999), 10, '0', STR_PAD_LEFT);

            \App\Models\Pago::create([
                'entrenador_id' => $user->id,
                'centro' => 'Centro Principal', // Valor por defecto
                'nombre_clase' => 'Entrenamiento Personal',
                'metodo_pago' => 'Tarjeta',
                'iban' => $iban, 
                'importe' => rand(30, 80) + (rand(0, 99) / 100),
                'fecha_registro' => $fechaBase->copy()->day(rand(1, 28)), 
            ]);
        }
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
