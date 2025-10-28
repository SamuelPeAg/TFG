<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            Usuario::create([
                'foto_de_perfil' => "perfil_$i.jpg",
                'IBAN' => 'ES' . rand(1000000000000000, 9999999999999999),
                'FirmaDigital' => "FirmaDigital_$i",
            ]);
        }   
    }   
}
