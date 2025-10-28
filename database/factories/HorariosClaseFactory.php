<?php

namespace Database\Factories;

use App\Models\HorarioClase;
use App\Models\Clase; // Para la relación 'clase()'
use App\Models\Centro; // Para la relación 'centro()'
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HorarioClase>
 */
class HorarioClaseFactory extends Factory
{
    /**
     * El nombre del modelo correspondiente.
     *
     * @var string
     */
    protected $model = HorarioClase::class;

    /**
     * Define el estado por defecto del modelo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generamos una fecha entre hoy y los próximos 3 meses
        $fecha = $this->faker->dateTimeBetween('now', '+3 months');
        
        $hora = Carbon::parse($fecha)->setTime(
            $this->faker->numberBetween(8, 20), // Horas de 8 a 20
            $this->faker->randomElement([0, 30]), // Minutos en 0 o 30
            0 // Segundos en 0
        );

        return [
            // --- Relaciones (Claves Foráneas) ---
            // Asegura que una 'Clase' y un 'Centro' se creen y se asocien automáticamente
            'clase_id' => Clase::factory(), 
            'centro_id' => Centro::factory(),

            // --- Campos Propios del Modelo ---
            'fecha' => $fecha->format('Y-m-d'),
            'hora' => $hora->format('H:i:s'),
            'lugar' => $this->faker->randomElement(['Sala A', 'Pista 2', 'Estudio Yoga']),
            'tipo_sesion' => $this->faker->randomElement(['Clase Grupal', 'Entrenamiento Personal', 'Clase de Prueba']),
            'capacidad' => $this->faker->numberBetween(10, 50),
        ];
    }
}
