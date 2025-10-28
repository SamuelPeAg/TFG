<?php

namespace Database\Factories;

use App\Models\Clase;
use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Factories\Factory;

class EntrenadorFactory extends Factory
{
    protected $model = Entrenador::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'id_clase' => Clase::factory(), 
        ];
    }
}