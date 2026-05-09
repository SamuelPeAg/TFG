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
        $clientes = \App\Models\User::role('cliente')->get();
        $horarios = \App\Models\HorarioClase::all();

        if ($clientes->isEmpty() || $horarios->isEmpty()) {
            return;
        }

        foreach ($horarios as $horario) {
            // Entre 5 y 15 reservas por sesión
            $numReservas = rand(5, 15);
            $clientesAleatorios = $clientes->random(min($numReservas, $clientes->count()));

            foreach ($clientesAleatorios as $cliente) {
                Reserva::create([
                    'id_usuario' => $cliente->id,
                    'id_horario_clase' => $horario->id,
                    'estado' => 'confirmado',
                ]);
            }
        }
    }
}