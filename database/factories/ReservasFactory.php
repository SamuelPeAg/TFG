<?php

namespace Database\Factories;

use App\Models\Reserva;
use App\Models\Usuario;
use App\Models\Clase;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservaFactory extends Factory
{
    protected $model = Reserva::class;

    public function definition(): array
    {
        return [
            'usuario_id'    => Usuario::factory(), // crea usuario si no existe
            'clase_id'      => Clase::factory(),   // crea clase si no existe
            'fecha_reserva' => $this->faker->dateTimeBetween('-1 week', '+1 month'),
        ];
    }
}

