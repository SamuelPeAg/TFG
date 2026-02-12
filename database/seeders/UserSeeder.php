<?php

namespace Database\Seeders;

use App\Models\Entrenador;
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
        $admin = Entrenador::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfil_admin.jpg',
                'iban' => 'ES1234567890123456789012',
                'firma_digital' => 'firma_admin',
            ]
        );

        // Asegura el rol admin
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
    }
}
