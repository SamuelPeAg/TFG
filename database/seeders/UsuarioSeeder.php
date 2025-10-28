<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UsuarioSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Perfil para el Usuario 1
        $user1 = User::where('email', 'test@example.com')->first();
        
        if ($user1) {
            Usuario::create([
                'user_id' => $user1->id, // Se asigna el ID del User
                'foto_de_perfil' => 'perfil_test.jpg',
                'IBAN' => 'ES1234567890123456789012',
                'FirmaDigital' => 'firma_digital_test',
            ]);
        }

        // Perfil para el Usuario 2
        $user2 = User::where('email', 'ana.lopez@example.com')->first();
        
        if ($user2) {
            Usuario::create([
                'user_id' => $user2->id, // Se asigna el ID del User
                'foto_de_perfil' => 'perfil_ana.jpg',
                'IBAN' => 'ES0987654321098765432109',
                'FirmaDigital' => 'firma_digital_ana',
            ]);
        }
    }
}