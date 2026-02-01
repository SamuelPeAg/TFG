<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Entrenador>
 */
class EntrenadorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'foto_de_perfil' => 'perfil_' . $this->faker->numberBetween(1, 20) . '.jpg',
            'iban' => $this->faker->iban(),
            'firma_digital' => 'firma_' . $this->faker->uuid(),
            'email_verified_at' => now(),
        ];
    }

    public function entrenador(): static
    {
        return $this->afterCreating(function (\App\Models\Entrenador $entrenador) {
            $entrenador->assignRole('entrenador');
        });
    }
}
