<?php

namespace Database\Factories;

use App\Models\Clase;
use App\Models\Centro; // Añadido
use App\Models\Entrenador;
use App\Models\HorarioClase;
use Illuminate\Database\Eloquent\Factories\Factory;

class HorarioClaseFactory extends Factory
{
    protected $model = HorarioClase::class;

    public function definition(): array
    {
        return [
            'id_clase' => Clase::factory(),
            'id_entrenador' => Entrenador::factory(),
            'id_centro' => Centro::factory(), 
            'fecha_hora_inicio' => $this->faker->dateTimeBetween('+1 dia', '+1 mes'),
            'capacidad' => $this->faker->numberBetween(10, 30),
        ];
    }
}