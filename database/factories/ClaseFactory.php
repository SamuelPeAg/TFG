<?php

namespace Database\Factories;

use App\Models\Centro;
use App\Models\Clase;
use Illuminate\Database\Eloquent\Factories\Factory;
use function fake;

class ClaseFactory extends Factory
{
    protected $model = Clase::class;

    public function definition(): array
    {
        // Usar un centro existente si hay alguno, si no crear uno
        $id_centro = Centro::exists() ? Centro::inRandomOrder()->first()->id : Centro::factory();

        return [
            'nombre' => fake()->randomElement(['Yoga para principiantes', 'Pilates intermedio', 'Crossfit avanzado', 'Zumba Fitness', 'GAP', 'Ciclo Indoor']),
            'descripcion' => fake()->sentence(),
            'duracion_minutos' => fake()->randomElement([45, 50, 60, 90]),
            'nivel' => fake()->randomElement(['facil', 'medio', 'dificil']),
            'id_centro' => $id_centro,
        ];
    }
}