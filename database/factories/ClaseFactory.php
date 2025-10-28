<?php

namespace Database\Factories;

use App\Models\Centro;
use App\Models\Clase;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClaseFactory extends Factory
{
    protected $model = Clase::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->randomElement(['Yoga', 'Spinning', 'Crossfit', 'Boxeo']),
            'descripcion' => fake()->sentence(),
            'duracion_minutos' => fake()->randomElement([45, 60, 90]),
            'nivel' => fake()->randomElement(['facil', 'medio', 'dificil']),
            'id_centro' => Centro::factory(), 
        ];
    }
}