<?php

namespace Database\Factories;

use App\Models\Centro;
use Illuminate\Database\Eloquent\Factories\Factory;

class CentrosFactory extends Factory
{
    protected $model = Centro::class;

    public function definition(): array
    {
        return [
            'nombre'    => $this->faker->company(),
            'direccion' => $this->faker->address(),
        ];
    }
}

