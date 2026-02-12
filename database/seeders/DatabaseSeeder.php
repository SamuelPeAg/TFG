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
            // 0. Roles y permisos (primero)
            RoleSeeder::class,
            // 1. Cuentas y perfiles
   // Crea las cuentas de login

            // 2. Datos base
            CentroSeeder::class,
            
            // 3. Clases y Horarios
            ClaseSeeder::class,         // Define los tipos de clase (Yoga, Pilates...)
            HorarioClaseSeeder::class,  // Crea las clases en el calendario (instancias)
            
            // 4. Datos adicionales

            // 5. Reservas (al final)
            ReservaSeeder::class,       // Usuarios apuntándose a clases
            
            // 6. Pagos
            PagoSeeder::class,
        ]);
        User::factory()->count(2)->entrenador()->create();
        User::factory()->count(20)->cliente()->create();
    }
}