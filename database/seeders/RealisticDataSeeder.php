<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Entrenador;
use App\Models\Pago;
use App\Models\Centro;
use App\Models\Suscripcion;
use App\Models\SuscripcionUsuario;
use App\Models\TipoSesion;
use App\Models\TipoCredito;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RealisticDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Limpiar datos dinámicos
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Pago::truncate();
        DB::table('pago_entrenador')->truncate();
        DB::table('pago_tipo_credito')->truncate();
        DB::table('pago_suscripcion')->truncate();
        SuscripcionUsuario::truncate();
        DB::table('creditos_lotes')->truncate();
        DB::table('reservas')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $centros = Centro::all();
        $entrenadores = Entrenador::role('entrenador')->get();
        $clientes = User::role('cliente')->get();
        $tiposSesion = TipoSesion::all();
        $suscripciones = Suscripcion::all();
        $tipoCredito = TipoCredito::where('nombre', 'Crédito Estándar')->first();

        if ($centros->isEmpty() || $entrenadores->isEmpty() || $clientes->isEmpty() || $tiposSesion->isEmpty()) {
            $this->command->error('Faltan datos base (centros, entrenadores, clientes o tipos de sesión). Ejecuta primero los seeders base.');
            return;
        }

        $now = Carbon::now();
        $mesesAtras = 5;

        $this->command->info('Generando datos realistas para los últimos ' . ($mesesAtras + 1) . ' meses...');

        // 2. Generar Ingresos por Suscripciones (Histórico)
        foreach ($clientes as $cliente) {
            $plan = $suscripciones->random();
            $fechaInicio = $now->copy()->subMonths($mesesAtras)->startOfMonth();
            
            // Asignar suscripción actual
            $userSub = SuscripcionUsuario::create([
                'id_usuario' => $cliente->id,
                'id_suscripcion' => $plan->id,
                'estado' => 'activo',
                'fecha_vencimiento_suscripcion' => $now->copy()->addDays(20),
                'dia_recarga' => $fechaInicio->day,
            ]);

            // Generar pagos mensuales de esta suscripción
            for ($m = 0; $m <= $mesesAtras; $m++) {
                $fechaPago = $fechaInicio->copy()->addMonths($m);
                if ($fechaPago->isAfter($now)) continue;

                Pago::create([
                    'user_id' => $cliente->id,
                    'centro' => $centros->random()->nombre,
                    'nombre_clase' => $plan->nombre,
                    'tipo_clase' => 'Suscripción',
                    'metodo_pago' => 'Tarjeta',
                    'importe' => $plan->precio,
                    'fecha_registro' => $fechaPago,
                ]);
            }
        }

        // 3. Generar Sesiones de Entrenamiento (Histórico y Futuro)
        $nombresClase = ['Yoga Flow', 'Pilates Reformer', 'HIIT Intenso', 'Fuerza Funcional', 'Movilidad Articular'];
        
        for ($m = -$mesesAtras; $m <= 1; $m++) { // De 5 meses atrás a 1 mes adelante
            $mesDate = $now->copy()->addMonths($m);
            $diasEnMes = $mesDate->daysInMonth;
            
            // Crear unas 20-30 sesiones por mes
            $numSesiones = rand(20, 30);
            for ($s = 0; $s < $numSesiones; $s++) {
                $fecha = $mesDate->copy()->day(rand(1, $diasEnMes))->hour(rand(8, 20))->minute(rand(0, 1) * 30);
                if ($fecha->isSunday()) continue;

                $entrenador = $entrenadores->random();
                $centro = $centros->random();
                $tipoSesion = $tiposSesion->random();
                $nombre = $nombresClase[array_rand($nombresClase)];

                // Registro de la sesión en sí (importe 0 porque es el evento)
                $pagoSesion = Pago::create([
                    'entrenador_id' => $entrenador->id,
                    'centro' => $centro->nombre,
                    'nombre_clase' => $nombre,
                    'tipo_clase' => $tipoSesion->nombre,
                    'capacidad_maxima' => $tipoSesion->capacidad_personas ?? 1,
                    'importe' => 0,
                    'fecha_registro' => $fecha,
                    'metodo_pago' => 'Sesión Calendario'
                ]);
                $pagoSesion->entrenadores()->sync([$entrenador->id]);
                if ($tipoCredito) $pagoSesion->tiposCredito()->sync([$tipoCredito->id]);

                // Añadir asistentes (pagos individuales si no es suscripción, o solo registro si lo es)
                $numAsistentes = rand(1, $pagoSesion->capacidad_maxima);
                $asistentes = $clientes->random($numAsistentes);
                
                foreach ($asistentes as $ast) {
                    // Si el pago es histórico, registramos el "consumo"
                    Pago::create([
                        'user_id' => $ast->id,
                        'entrenador_id' => $entrenador->id,
                        'centro' => $centro->nombre,
                        'nombre_clase' => $nombre,
                        'tipo_clase' => $tipoSesion->nombre,
                        'importe' => rand(0, 1) === 0 ? 0 : 25.00, // Algunos pagan suelto, otros usan bono (0€ extra)
                        'fecha_registro' => $fecha,
                        'metodo_pago' => 'Bono',
                    ]);
                }
            }
        }

        $this->command->info('Base de datos poblada con éxito.');
    }
}
