<?php

namespace Database\Seeders;

use App\Models\Centro;
use App\Models\Clase;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $centros = Centro::all();

        if ($centros->isEmpty()) {
            $this->command->info('No hay centros. Primero ejecuta el seeder de Centros.');
            return;
        }

        // Crear algunas clases de ejemplo
        $clases = [
            [
                'nombre' => 'Yoga para principiantes',
                'descripcion' => 'Clase de yoga básica para iniciar tu práctica.',
                'duracion_minutos' => 60,
                'nivel' => 'facil',
            ],
            [
                'nombre' => 'Pilates intermedio',
                'descripcion' => 'Pilates para fortalecer core y flexibilidad.',
                'duracion_minutos' => 45,
                'nivel' => 'medio',
            ],
            [
                'nombre' => 'Crossfit avanzado',
                'descripcion' => 'Entrenamiento intenso para nivel avanzado.',
                'duracion_minutos' => 50,
                'nivel' => 'dificil',
            ],
            [
                'nombre' => 'Cardio y resistencia',
                'descripcion' => 'Clase de cardio para mejorar la resistencia física.',
                'duracion_minutos' => 40,
                'nivel' => 'medio',
            ],
        ];

        foreach ($clases as $clase) {
            // Asignamos aleatoriamente un centro existente
            $centro = $centros->random();

            Clase::create([
                'nombre' => $clase['nombre'],
                'descripcion' => $clase['descripcion'],
                'duracion_minutos' => $clase['duracion_minutos'],
                'nivel' => $clase['nivel'],
                'id_centro' => $centro->id,
            ]);
        }
    }
}
