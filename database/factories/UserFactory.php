<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            'foto_de_perfil' => null,
            'IBAN' => $this->faker->optional()->iban('ES'),
            'FirmaDigital' => $this->faker->optional()->text(100),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

