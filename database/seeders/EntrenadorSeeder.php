<?php

namespace Database\Seeders;

use App\Models\Entrenador;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // <--- IMPRESCINDIBLE importar esto

class EntrenadorSeeder extends Seeder
{
    public function run(): void
    {
        $entrenadores = [
            [
                'nombre' => 'Juan Pérez', 
                'email' => 'juan.perez@example.com',
                'password' => Hash::make('password123'), // <--- Faltaba esto
                'iban' => 'ES0000000000000000000001',    // <--- Faltaba esto
                'rol' => 'entrenador'
            ],
            [
                'nombre' => 'Ana García', 
                'email' => 'ana.garcia@example.com',
                'password' => Hash::make('password123'), // <--- Faltaba esto
                'iban' => 'ES0000000000000000000002',    // <--- Faltaba esto
                'rol' => 'entrenador'
            ],
            [
                'nombre' => 'Carlos Sánchez', 
                'email' => 'carlos.sanchez@example.com',
                'password' => Hash::make('password123'), // <--- Faltaba esto
                'iban' => 'ES0000000000000000000003',    // <--- Faltaba esto
                'rol' => 'entrenador'
            ],
        ];

        foreach ($entrenadores as $entrenador) {
            Entrenador::create($entrenador);
        }
    }
}