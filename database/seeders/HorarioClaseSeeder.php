<?php

namespace Database\Seeders;

use App\Models\HorarioClase;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class HorarioClaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $horarios = [
            // Yoga con Juan Pérez en Centro 1
            [
                'id_clase' => 1,        // ID de la Clase "Yoga"
                'id_entrenador' => 1, // ID del Entrenador "Juan Pérez"
                'id_centro' => 1,       // ID del Centro "Central"
                'fecha_hora_inicio' => '2025-11-10 09:00:00',
                'capacidad' => 15,
            ],
            // Pilates con Ana García en Centro 1
            [
                'id_clase' => 2,
                'id_entrenador' => 2,
                'id_centro' => 1,
                'fecha_hora_inicio' => '2025-11-10 18:00:00',
                'capacidad' => 10,
            ],
            // Crossfit con Carlos Sánchez en Centro 2
            [
                'id_clase' => 3,
                'id_entrenador' => 3,
                'id_centro' => 2,
                'fecha_hora_inicio' => '2025-11-11 19:00:00',
                'capacidad' => 20,
            ],
        ];

        // Asumimos que los IDs serán 1, 2, 3...
        foreach ($horarios as $horario) {
            HorarioClase::create($horario);
        }
    }
}