<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class HorarioClaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $clases = \App\Models\Clase::all();
        $entrenadores = \App\Models\Entrenador::role('entrenador')->get();
        $centros = \App\Models\Centro::all();

        if ($clases->isEmpty() || $entrenadores->isEmpty() || $centros->isEmpty()) {
            return;
        }

        // Crear horarios para los próximos 14 días
        for ($i = 0; $i < 14; $i++) {
            $fecha = now()->addDays($i);
            
            // 8 sesiones por día
            for ($j = 0; $j < 8; $j++) {
                $clase = $clases->random();
                \App\Models\HorarioClase::create([
                    'clase_id' => $clase->id,
                    'entrenador_id' => $entrenadores->random()->id,
                    'centro_id' => $clase->id_centro,
                    'fecha_hora_inicio' => $fecha->copy()->hour(rand(7, 22))->minute(rand(0, 59))->second(0),
                    'capacidad' => rand(8, 25),
                ]);
            }
        }
    }
}