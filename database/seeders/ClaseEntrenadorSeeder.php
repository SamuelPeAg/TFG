<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Usamos DB para inserción directa
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ClaseEntrenadorSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Asignamos manualmente qué entrenador da qué clase
        DB::table('clase_entrenador')->insert([
            ['clase_id' => 1, 'entrenador_id' => 1], // Juan Pérez da Yoga (Clase 1)
            ['clase_id' => 2, 'entrenador_id' => 2], // Ana García da Pilates (Clase 2)
            ['clase_id' => 3, 'entrenador_id' => 3], // Carlos Sánchez da Crossfit (Clase 3)
            ['clase_id' => 1, 'entrenador_id' => 2], // Ana García también da Yoga (Clase 1)
        ]);
    }
}