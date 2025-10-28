<?php

namespace Database\Seeders;

use App\Models\Entrenador;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EntrenadorSeeder extends Seeder
{
    public function run(): void
    {
        $entrenadores = [
            ['nombre' => 'Juan Pérez', 'email' => 'juan.perez@example.com'],
            ['nombre' => 'Ana García', 'email' => 'ana.garcia@example.com'],
            ['nombre' => 'Carlos Sánchez', 'email' => 'carlos.sanchez@example.com'],
        ];

        // Asumimos que los IDs serán 1, 2, 3...
        foreach ($entrenadores as $entrenador) {
            Entrenador::create($entrenador);
        }
    }
}