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
            'nombre' => $this->faker->randomElement(['Yoga', 'Pilates', 'Crossfit', 'Spinning']),
            'descripcion' => $this->faker->sentence(),
            'duracion_minutos' => $this->faker->randomElement([45, 60, 90]),
            'nivel' => $this->faker->randomElement(['facil', 'medio', 'dificil']),
            'id_centro' => Centro::factory(),
        ];
    }
}