<?php

namespace Database\Seeders;

use App\Models\ReservaEntrenador;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

// Asegúrate de que el nombre del archivo y la clase sea "ReservaEntrenadorSeeder"
class ReservaEntrenadorSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $disponibilidad = [
            // Juan Pérez disponible 1h en Centro 1
            [
                'entrenador_id' => 1,
                'centro_id' => 1,
                'fecha_inicio' => '2025-11-15 10:00:00',
                'fecha_fin' => '2025-11-15 11:00:00',
                'disponible' => true,
            ],
            // Ana García disponible 1h en Centro 1
            [
                'entrenador_id' => 2,
                'centro_id' => 1,
                'fecha_inicio' => '2025-11-16 11:00:00',
                'fecha_fin' => '2025-11-16 12:00:00',
                'disponible' => true,
            ],
        ];

        foreach ($disponibilidad as $item) {
            ReservaEntrenador::create($item);
        }
    }
}