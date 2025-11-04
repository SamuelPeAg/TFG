<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Usuario 1
        User::create([
            'name' => 'Usuario de Prueba',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'foto_de_perfil' => 'perfil_test.jpg',
            'IBAN' => 'ES1234567890123456789012',
            'FirmaDigital' => 'firma_digital_test',
        ]);

        // Usuario 2
        User::create([
            'name' => 'Ana López',
            'email' => 'ana.lopez@example.com',
            'password' => Hash::make('123456'),
            'foto_de_perfil' => 'perfil_ana.jpg',
            'IBAN' => 'ES0987654321098765432109',
            'FirmaDigital' => 'firma_digital_ana',
        ]);
    }
}
