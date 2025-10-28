<?php

namespace Database\Seeders;

use App\Models\HorarioClase;
use App\Models\Reserva;
use App\Models\ReservaEntrenador;
use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReservaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $usuarios = Usuario::all();
        $horariosClases = HorarioClase::all();
        $reservasEntrenadores = ReservaEntrenador::all();

        if ($usuarios->isEmpty() || $horariosClases->isEmpty()) {
            $this->command->info('No hay usuarios o horarios de clases. Ejecuta sus seeders primero.');
            return;
        }


        $usuario = $usuarios->random();
        $horarioClase = $horariosClases->random();
        $reservaEntrenador = $reservasEntrenadores->isNotEmpty() ? $reservasEntrenadores->random() : null;


        Reserva::create([
            'usuario_id' => $usuario->id,
            'horario_clase_id' => $horarioClase->id,
            'reserva_entrenador_id' => $reservaEntrenador?->id,
            'fecha' => now()->addDays(rand(1, 30))->toDateString(),
            'estado' => ['pagada', 'pendiente', 'confirmado'][rand(0, 2)],
        ]);
    }
}
