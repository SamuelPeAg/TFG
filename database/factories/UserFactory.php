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
            'iban' => fake()->iban(),
            'firma_digital' => 'firma_' . fake()->uuid(),
        ];
    }

    /**
     * Estados con roles Spatie
     */
    public function admin(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole('admin');
        });
    }

    public function entrenador(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole('entrenador');
        });
    }

    public function cliente(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole('cliente');
        });
    }

    /**
     * Helper: IBAN español falso (válido en formato, no necesariamente real)
     */
    private function fakeSpanishIban(): string
    {
        // ES + 22 dígitos
        $digits = '';
        for ($i = 0; $i < 22; $i++) {
            $digits .= (string) random_int(0, 9);
        }
        return 'ES' . $digits;
    }
}
