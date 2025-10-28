<?php

namespace Database\Seeders;

use App\Models\Clase;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClaseSeeder extends Seeder
{
    public function run(): void
    {
        $clases = [
            [
                'nombre' => 'Yoga para principiantes',
                'descripcion' => 'Clase de yoga básica.',
                'duracion_minutos' => 60,
                'nivel' => 'facil',
                'id_centro' => 1, // Asignado al Centro 1
            ],
            [
                'nombre' => 'Pilates intermedio',
                'descripcion' => 'Pilates para fortalecer core.',
                'duracion_minutos' => 45,
                'nivel' => 'medio',
                'id_centro' => 1, // Asignado al Centro 1
            ],
            [
                'nombre' => 'Crossfit avanzado',
                'descripcion' => 'Entrenamiento intenso.',
                'duracion_minutos' => 50,
                'nivel' => 'dificil',
                'id_centro' => 2, // Asignado al Centro 2
            ],
        ];

        // Asumimos que los IDs serán 1, 2, 3...
        foreach ($clases as $clase) {
            Clase::create($clase);
        }
    }
}