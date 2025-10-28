<?php

namespace Database\Factories;

use App\Models\Centro;
use App\Models\Entrenador;
use App\Models\ReservaEntrenador;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservaEntrenadorFactory extends Factory
{
    protected $model = ReservaEntrenador::class;

    public function definition(): array
    {
        $inicio = $this->faker->dateTimeBetween('+1 dia', '+1 mes');
        $fin = (clone $inicio)->modify('+1 hora');

        return [
            'entrenador_id' => Entrenador::factory(),
            'centro_id' => Centro::factory(),
            'fecha_inicio' => $inicio,
            'fecha_fin' => $fin,
            'disponible' => true,
        ];
    }
}