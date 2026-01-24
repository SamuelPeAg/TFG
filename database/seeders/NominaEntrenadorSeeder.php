<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// Importamos el modelo "raro"
use App\Models\Nomina_entrenador; 
use App\Models\User;

class NominaEntrenadorSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buscamos un usuario real (o creamos uno)
        $user = User::first(); 
        if (!$user) {
             $user = User::factory()->create(['email' => 'admin@factomove.com']);
        }

        // 2. Creamos las nóminas usando la factory
        Nomina_entrenador::factory()->count(10)->create([
            'user_id' => $user->id
        ]);
    }
}