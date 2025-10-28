<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'contraseña' => 'password', 

            'foto_de_perfil' => fake()->imageUrl(640, 480, 'people', true),
            'IBAN' => 'ES' . fake()->numerify('####################'),
            'FirmaDigital' => fake()->sha256(),
        ];
    }
}