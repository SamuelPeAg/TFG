<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Entrenador;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Datos base indispensables (Centros y Empresas)
            EmpresaSeeder::class,
            CentroSeeder::class,

            // 2. Roles, permisos y usuarios iniciales (Necesitan centros)
            RoleSeeder::class,
            UserSeeder::class,
            TiposSesionSeeder::class,
        ]);

        // 3. Crear pool de usuarios (Entrenadores y Clientes)
        Entrenador::factory()->count(5)->entrenador()->create([
            'centro_id' => \App\Models\Centro::first()?->id ?? 1
        ]);
        User::factory()->count(20)->cliente()->create([
            'centro_id' => \App\Models\Centro::first()?->id ?? 1
        ]);

        $this->call([
            // 4. Estructura base de clases y suscripciones
            SuscripcionSeeder::class,
            ClaseSeeder::class,
            TiposSesionSeeder::class,
            
            // 5. Generar datos dinámicos realistas (Pagos, Reservas, Calendario)
            RealisticDataSeeder::class,

            // 6. Nóminas
            NominaSeeder::class,
        ]);
    }
}