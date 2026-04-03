<?php

namespace Database\Factories;

use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class EntrenadorFactory extends Factory
{
    protected $model = Entrenador::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'dni' => fake()->unique()->regexify('[0-9]{8}[A-Z]'),
            'iban' => $this->fakeSpanishIban(),
            'precio_hora' => fake()->randomFloat(2, 10, 30),
        ];
    }

    public function admin(): static
    {
        return $this->afterCreating(function (Entrenador $entrenador) {
            $entrenador->assignRole('admin');
        });
    }

    public function entrenador(): static
    {
        return $this->afterCreating(function (Entrenador $entrenador) {
            $entrenador->assignRole('entrenador');
        });
    }

    private function fakeSpanishIban(): string
    {
        $digits = '';
        for ($i = 0; $i < 22; $i++) {
            $digits .= (string) random_int(0, 9);
        }
        return 'ES' . $digits;
    }
}
