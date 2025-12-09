<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sessiones>
 */
class SessionesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // genera un usuario automáticamente
            'IBAN' => $this->faker->numberBetween(10000000, 99999999), // AJUSTA si necesitas más longitud
            'Pago' => $this->faker->numberBetween(10, 500), // cantidad de pago
            'Fecharegistro' => $this->faker->date(),
        ];
    }
}
