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
                'duracion_minutos' => 60,
                'nivel' => 'medio',
                'id_centro' => $centros->random()->id,
            ],
            [
                'nombre' => 'Crossfit avanzado',
                'descripcion' => 'WOD de alta intensidad para usuarios experimentados.',
                'duracion_minutos' => 60,
                'nivel' => 'dificil',
                'id_centro' => $centros->random()->id,
            ],
        ];

        $tipoCredito = \App\Models\TipoCredito::first();

        foreach ($clases as $claseData) {
            $clase = Clase::updateOrCreate(
                ['nombre' => $claseData['nombre'], 'id_centro' => $claseData['id_centro']],
                $claseData
            );

            // Asignar créditos permitidos a la clase base
            if ($tipoCredito) {
                $clase->tiposCredito()->syncWithoutDetaching([$tipoCredito->id]);
            }
        }

        // Generar algunas clases adicionales aleatorias usando el factory (que ya usa centros existentes)
        // Clase::factory()->count(5)->create();
    }
}