<?php

namespace Database\Seeders;

use App\Models\Entrenador;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EntrenadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
      Entrenador::create([
            'nombre' => 'Juan Pérez',
            'email' => 'juan.perez@example.com',
        ]);
    }
}
