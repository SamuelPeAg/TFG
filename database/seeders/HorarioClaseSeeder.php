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
        $entrenadores = \App\Models\User::role('entrenador')->get();
        $centros = \App\Models\Centro::all();

        if ($clases->isEmpty() || $entrenadores->isEmpty() || $centros->isEmpty()) {
            return;
        }

        // Crear horarios para los próximos 7 días
        for ($i = 0; $i < 7; $i++) {
            $fecha = now()->addDays($i);
            
            // 4 sesiones por día
            for ($j = 0; $j < 4; $j++) {
                $clase = $clases->random();
                \App\Models\HorarioClase::create([
                    'clase_id' => $clase->id,
                    'entrenador_id' => $entrenadores->random()->id,
                    'centro_id' => $clase->id_centro, // Usar el centro de la propia clase o uno aleatorio
                    'fecha_hora_inicio' => $fecha->copy()->hour(rand(9, 21))->minute(0)->second(0),
                    'capacidad' => rand(10, 20),
                ]);
            }
        }
    }
}