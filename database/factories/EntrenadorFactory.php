<?php

namespace Database\Factories;

use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Factories\Factory;

class EntrenadorFactory extends Factory
{
    protected $model = Entrenador::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
        ];
    }
}