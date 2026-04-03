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

        // Crear Cliente de prueba
        $cliente = User::firstOrCreate(
            ['email' => 'cliente@factomove.com'],
            [
                'name' => 'Cliente de Prueba',
                'password' => Hash::make('cliente123'),
                'dni' => '12345678X',
                'direccion' => 'Calle Falsa 123',
                'ciudad' => 'Córdoba',
            ]
        );

        // Asegura el rol cliente (guard web)
        if (!$cliente->hasRole('cliente')) {
            $cliente->assignRole('cliente');
        }
    }
}
