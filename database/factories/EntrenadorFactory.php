<?php

namespace Database\Factories;

use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Factories\Factory;

class EntrenadorFactory extends Factory
{
    protected $model = Entrenador::class;

public function definition()
{
    return [
        'nombre' => $this->faker->name(),
        'email' => $this->faker->unique()->safeEmail(),
        'iban' => $this->faker->iban('ES'), 
        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        'rol' => 'entrenador',
    ];
}
}