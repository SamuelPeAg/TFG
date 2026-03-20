<?php

namespace Database\Seeders;

use App\Models\User;
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
            RoleSeeder::class,
        ]);

        // 1. Crear pool de usuarios (Entrenadores y Clientes) para que el resto de seeders los usen
        \App\Models\Entrenador::factory()->count(5)->entrenador()->create();
        User::factory()->count(20)->cliente()->create();

        $this->call([
            UserSeeder::class, // Incluir UserSeeder para el admin y cliente fijo
            CentroSeeder::class,

                // 3. Clases y Horarios
            ClaseSeeder::class,         // Define los tipos de clase (Yoga, Pilates...)
            HorarioClaseSeeder::class,  // Crea las clases en el calendario (instancias)

                // 4. Datos adicionales

                // 5. Reservas
            ReservaSeeder::class,       // Usuarios apuntándose a clases

                // 6. Pagos
            PagoSeeder::class,
        ]);
    }
}