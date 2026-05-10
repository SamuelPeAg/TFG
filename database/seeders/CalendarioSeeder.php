<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pago;
use App\Models\User;
use App\Models\Entrenador;
use App\Models\Centro;
use App\Models\TipoSesion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CalendarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Limpiar datos previos del calendario para este mes (opcional, pero ayuda a ver el resultado limpio)
        // DB::table('pagos')->whereBetween('fecha_registro', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])->delete();

        $entrenadores = Entrenador::all();
        $centros = Centro::all();
        $tipos = TipoSesion::all();

        if ($entrenadores->isEmpty() || $centros->isEmpty() || $tipos->isEmpty()) {
            return;
        }

        $nombresClase = ['Funcional', 'Fuerza', 'Pilates', 'Yoga', 'HIIT', 'Movilidad', 'Core', 'Glúteo', 'Espalda Sana'];
        
        $startOfMonth = Carbon::create(2026, 5, 1)->startOfDay();
        $endOfMonth = Carbon::create(2026, 5, 31)->endOfDay();

        // Generar unas 80-100 sesiones repartidas
        for ($i = 0; $i < 100; $i++) {
            $randomDay = rand(0, 30);
            $fecha = $startOfMonth->copy()->addDays($randomDay);
            
            // Horarios entre 07:00 y 21:00
            $hora = rand(7, 21);
            $minuto = (rand(0, 1) == 1) ? 30 : 0;
            $fecha->hour($hora)->minute($minuto)->second(0);

            // No crear clases los domingos (opcional)
            if ($fecha->isSunday()) continue;

            $centro = $centros->random();
            $tipo = $tipos->random();
            $entrenador = $entrenadores->random();
            $nombreClase = $nombresClase[array_rand($nombresClase)];

            $pago = Pago::create([
                'user_id' => null, // Sesión "abierta" en el calendario
                'entrenador_id' => $entrenador->id,
                'centro' => $centro->nombre,
                'nombre_clase' => $nombreClase,
                'tipo_clase' => $tipo->nombre, // Usamos el nombre (EP, DUO, TRIO, etc)
                'capacidad_maxima' => $tipo->capacidad_personas ?? 1,
                'importe' => 0,
                'fecha_registro' => $fecha,
                'horas_cancelacion' => $tipo->horas_cancelacion_default ?? 24,
                'metodo_pago' => null,
            ]);

            // Sincronizar relación muchos a muchos con entrenadores
            $pago->entrenadores()->sync([$entrenador->id]);
            
            // Asignar créditos por defecto si tiene
            $defaultCredits = $tipo->tiposCredito ? $tipo->tiposCredito->pluck('id')->toArray() : [];
            if (!empty($defaultCredits)) {
                $pago->tiposCredito()->sync($defaultCredits);
            }
        }

        $this->command->info('Calendario poblado con 100 clases para Mayo 2026.');
    }
}
