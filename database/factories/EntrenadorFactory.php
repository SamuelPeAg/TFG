<?php

namespace Database\Factories;

use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EntrenadorFactory extends Factory
{
    protected $model = Entrenador::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'activation_token' => null,
            'foto_de_perfil' => null,
            'iban' => fake()->iban(),
        ];
    }

    /**
     * Estado para Admin
     */
    public function admin(): static
    {
        return $this->afterCreating(function (Entrenador $entrenador) {
            $entrenador->assignRole('admin');
        });
    }

    /**
     * Estado para Entrenador
     */
    public function entrenador(): static
    {
        return $this->afterCreating(function (Entrenador $entrenador) {
            $entrenador->assignRole('entrenador');
        });
    }
}
