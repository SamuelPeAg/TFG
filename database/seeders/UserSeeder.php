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
        // Asegurar que las configuraciones de permisos están limpias
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Usuario 1
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Usuario de Prueba',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfil_test.jpg',
                'iban' => 'ES1234567890123456789012',
                'firma_digital' => 'firma_digital_test',
            ]
        );

        User::firstOrCreate(
            ['email' => 'Pacopepe@example.com'],
            [
                'name' => 'Paco Pepe',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfill_test.jpg',
                'iban' => 'ES12345678901234545689012',
                'firma_digital' => 'firma_digitall_test',
            ]
        );

        // Usuario 2
        User::firstOrCreate(
            ['email' => 'ana.lopez@example.com'],
            [
                'name' => 'Ana López',
                'password' => Hash::make('123456'),
                'foto_de_perfil' => 'perfil_ana.jpg',
                'iban' => 'ES0987654321098765432109',
                'firma_digital' => 'firma_digital_ana',
            ]
        );

        // Asignar rol admin al usuario de prueba si existe
        $admin = User::where('email', 'test@example.com')->first();
        if ($admin) {
            $admin->assignRole('admin');
        }

        // Crear y asignar rol a un entrenador
        $trainer = User::firstOrCreate(
            ['email' => 'entrenador@example.com'],
            [
                'name' => 'Entrenador Demo',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfil_entrenador.jpg',
                'iban' => 'ES1111111111111111111111',
                'firma_digital' => 'firma_entrenador',
            ]
        );
        $trainer->assignRole('entrenador');

        // Crear y asignar rol a un cliente
        $client = User::firstOrCreate(
            ['email' => 'cliente@example.com'],
            [
                'name' => 'Cliente Demo',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfil_cliente.jpg',
                'iban' => 'ES2222222222222222222222',
                'firma_digital' => 'firma_cliente',
            ]
        );
        $client->assignRole('cliente');

        // Crear 5 clientes numerados
        for ($i = 1; $i <= 8; $i++) {
            $c = User::firstOrCreate(
                ['email' => "cliente{$i}@example.com"],
                [
                    'name' => "Cliente {$i}",
                    'password' => Hash::make('password'),
                    'foto_de_perfil' => "perfil_cliente_{$i}.jpg",
                    'iban' => "ES" . str_pad($i, 22, '0', STR_PAD_LEFT),
                    'firma_digital' => "firma_cliente_{$i}",
                ]
            );
            $c->assignRole('cliente');
        }
    }
}
