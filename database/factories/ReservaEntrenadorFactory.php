<?php

namespace Database\Factories;

use App\Models\ReservaEntrenador;
use App\Models\Entrenador;
use App\Models\Reserva;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservaEntrenadorFactory extends Factory
{
    protected $model = ReservaEntrenador::class;

    public function definition(): array
    {
        return [
            'entrenador_id' => Entrenador::factory(), // crea entrenador si no existe
            'reserva_id'    => Reserva::factory(),    // crea reserva si no existe
        ];
    }
}

