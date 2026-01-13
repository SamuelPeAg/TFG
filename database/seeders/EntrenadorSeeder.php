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
        ];

        foreach ($entrenadores as $entrenador) {
            Entrenador::create($entrenador);
        }
    }
}