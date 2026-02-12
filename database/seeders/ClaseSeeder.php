<?php

namespace Database\Seeders;

use App\Models\Clase;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClaseSeeder extends Seeder
{
    public function run(): void
    {
        $centros = \App\Models\Centro::all();
        
        if ($centros->isEmpty()) {
            return;
        }

        $clases = [
            [
                'nombre' => 'Yoga para principiantes',
                'descripcion' => 'Clase de yoga básica para todos los niveles.',
                'duracion_minutos' => 60,
                'nivel' => 'facil',
                'id_centro' => $centros->random()->id,
            ],
            [
                'nombre' => 'Pilates intermedio',
                'descripcion' => 'Pilates centrado en fortalecer el core y flexibilidad.',
                'duracion_minutos' => 45,
                'nivel' => 'medio',
                'id_centro' => $centros->random()->id,
            ],
            [
                'nombre' => 'Crossfit avanzado',
                'descripcion' => 'WOD de alta intensidad para usuarios experimentados.',
                'duracion_minutos' => 50,
                'nivel' => 'dificil',
                'id_centro' => $centros->random()->id,
            ],
        ];

        foreach ($clases as $clase) {
            Clase::create($clase);
        }

        // Generar algunas clases adicionales aleatorias usando el factory (que ya usa centros existentes)
        Clase::factory()->count(5)->create();
    }
}