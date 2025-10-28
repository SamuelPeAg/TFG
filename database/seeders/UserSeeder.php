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
        // Usuario de Prueba 1
        User::create([
            'name' => 'Usuario de Prueba',
            'email' => 'test@example.com',
            'password' => Hash::make('password'), // Contraseña hasheada
        ]);

        // Usuario de Prueba 2
        User::create([
            'name' => 'Ana López',
            'email' => 'ana.lopez@example.com',
            'password' => Hash::make('123456'), // Contraseña hasheada
        ]);
    }
}