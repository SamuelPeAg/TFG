<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * El nombre del modelo correspondiente.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define el estado por defecto del modelo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            // La contraseña debe ser 'password' ya hasheada por el método casts() del modelo
            // Usamos 'contraseña' aquí porque es el nombre de la columna en tu fillable.
            'contraseña' => 'password', 
            // Esto es opcional, pero común en User factories
            'email_verified_at' => now(), 
        ];
    }
    
}