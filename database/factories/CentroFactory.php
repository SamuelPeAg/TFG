<?php

namespace Database\Factories;

use App\Models\Centro;
use Illuminate\Database\Eloquent\Factories\Factory;
use function fake;

class CentroFactory extends Factory
{
    protected $model = Centro::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->company() . ' Fitness',
            'direccion' => fake()->address(),
        ];
    }
}