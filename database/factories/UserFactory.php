<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use function fake;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'dni' => fake()->unique()->regexify('[0-9]{8}[A-Z]'),
            'direccion' => fake()->streetAddress(),
            'codigo_postal' => fake()->postcode(),
            'ciudad' => fake()->city(),
        ];
    }

    /**
     * Estados con roles Spatie (Guard: web)
     */
    public function cliente(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole('cliente');
        });
    }
}
