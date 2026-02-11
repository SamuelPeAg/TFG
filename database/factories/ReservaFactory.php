<?php

namespace Database\Factories;

use App\Models\HorarioClase;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservaFactory extends Factory
{
    protected $model = Reserva::class;

    public function definition(): array
    {
        return [
            'id_usuario' => User::factory(),
            'id_horario_clase' => HorarioClase::factory(),
            'estado' => fake()->randomElement(['pagada', 'pendiente', 'confirmado']),
        ];
    }
}