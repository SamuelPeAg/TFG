<?php

namespace Database\Seeders;

use App\Models\Reserva;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ReservaSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // El Usuario 1 (test@example.com) reserva la clase de Yoga (Horario 1)
        Reserva::create([
            'id_usuario' => 1,       // ID del User 1
            'id_horario_clase' => 1, // ID del HorarioClase 1 (Yoga)
            'estado' => 'confirmado',
        ]);

        // El Usuario 2 (ana.lopez@example.com) reserva la clase de Pilates (Horario 2)
        Reserva::create([
            'id_usuario' => 2,       // ID del User 2
            'id_horario_clase' => 2, // ID del HorarioClase 2 (Pilates)
            'estado' => 'pagada',
        ]);
    }
}