<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario 1
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Usuario de Prueba',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfil_test.jpg',
                'IBAN' => 'ES1234567890123456789012',
                'FirmaDigital' => 'firma_digital_test',
            ]
        );

        User::firstOrCreate(
            ['email' => 'Pacopepe@example.com'],
            [
                'name' => 'Paco Pepe',
                'password' => Hash::make('password'),
                'foto_de_perfil' => 'perfill_test.jpg',
                'IBAN' => 'ES12345678901234545689012',
                'FirmaDigital' => 'firma_digitall_test',
            ]
        );

        // Usuario 2
        User::firstOrCreate(
            ['email' => 'ana.lopez@example.com'],
            [
                'name' => 'Ana López',
                'password' => Hash::make('123456'),
                'foto_de_perfil' => 'perfil_ana.jpg',
                'IBAN' => 'ES0987654321098765432109',
                'FirmaDigital' => 'firma_digital_ana',
            ]
        );
    }
}
