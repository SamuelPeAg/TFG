<?php

namespace Database\Seeders;

use App\Models\FacturaEntrenador;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class FacturaEntrenadorSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        FacturaEntrenador::create([
            'id_entrenador' => 1, // Factura para Juan Pérez
            'fecha' => '2025-11-01',
            'importe' => 150.00,
            'estado' => 'pendiente', 
        ]);

        FacturaEntrenador::create([
            'id_entrenador' => 2, // Factura para Ana García
            'fecha' => '2025-11-01',
            'importe' => 220.50,
            'estado' => 'pagada', 
        ]);
    }
}