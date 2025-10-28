<?php

namespace Database\Seeders;

use App\Models\Entrenador;
use App\Models\FacturaEntrenador;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FacturaEntrenadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $entrenadores = Entrenador::all();

        if ($entrenadores->isEmpty()) {
            $this->command->info('No hay entrenadores. Ejecuta primero el seeder de entrenadores.');
            return;
        }

        $entrenador = $entrenadores->random();

        FacturaEntrenador::create([
            'entrenador_id' => $entrenador->id,
            'fecha' => now()->toDateString(),
            'importe' => 150.00,
            'estado' => 'pendiente', 
        ]);
    }
}
