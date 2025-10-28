<?php

namespace Database\Factories;

use App\Models\Clase;
use App\Models\Centro;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClaseFactory extends Factory
{
    protected $model = Clase::class;

    public function definition(): array
    {
        return [
            'nombre'      => ucfirst($this->faker->word()) . ' Class',
            'descripcion' => $this->faker->sentence(8),
            'duracion'    => $this->faker->numberBetween(30, 90), // minutos
            'centro_id'   => Centro::factory(), // crea centro si no existe
        ];
    }
}
