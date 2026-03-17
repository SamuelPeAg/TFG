<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Limpia caché de permisos de Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Usuario admin fijo (imprescindible para entrar)
        $admin = \App\Models\Entrenador::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'nombre' => 'Admin',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfil_admin.jpg',
                'iban' => 'ES1234567890123456789012',
            ]
        );

        // Asegura el rol admin
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        // Crear un cliente fijo para pruebas
        $cliente = User::firstOrCreate(
            ['email' => 'cliente@factomove'],
            [
                'name' => 'Cliente de Prueba',
                'password' => Hash::make('password'),
            ]
        );
        $cliente->assignRole('cliente');

        // Generar 10 alumnos/clientes aleatorios
        User::factory(10)->cliente()->create();
    }
}
}
