<?php

namespace Database\Factories;

use App\Models\Entrenador;
use App\Models\FacturaEntrenador;
use Illuminate\Database\Eloquent\Factories\Factory;

class FacturaEntrenadorFactory extends Factory
{
    protected $model = FacturaEntrenador::class;

    public function definition(): array
    {
        return [
            'id_entrenador' => Entrenador::factory(),
            'fecha' => $this->faker->date(),
            'importe' => $this->faker->randomFloat(2, 50, 500),
            'estado' => $this->faker->randomElement(['pendiente', 'pagada', 'anulada']),
        ];
    }
}