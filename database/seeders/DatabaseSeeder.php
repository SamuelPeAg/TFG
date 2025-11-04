<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Cuentas y perfiles
            UserSeeder::class,      // Crea las cuentas de login

            // 2. Datos base
            CentroSeeder::class,
            EntrenadorSeeder::class,
            
            // 3. Clases y Horarios
            ClaseSeeder::class,         // Define los tipos de clase (Yoga, Pilates...)
            ClaseEntrenadorSeeder::class, // Asigna qué entrenador puede dar qué clase
            HorarioClaseSeeder::class,  // Crea las clases en el calendario (instancias)
            
            // 4. Datos adicionales
            ReservaEntrenadorSeeder::class, // Disponibilidad de entrenadores personales
            FacturaEntrenadorSeeder::class, // Facturas de ejemplo

            // 5. Reservas (al final)
            ReservaSeeder::class,       // Usuarios apuntándose a clases
        ]);
    }
}