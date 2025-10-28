<?php

namespace Database\Factories;

use App\Models\FacturaEntrenador;
use App\Models\Entrenador; // Necesario para la relación
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FacturaEntrenador>
 */
class FacturaEntrenadorFactory extends Factory
{
    /**
     * El nombre del modelo correspondiente.
     *
     * @var string
     */
    protected $model = FacturaEntrenador::class;

    /**
     * Define el estado por defecto del modelo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Clave Foránea: Asocia automáticamente un Entrenador existente o crea uno nuevo.
            'entrenador_id' => Entrenador::factory(), 

            // Campos Propios del Modelo FacturaEntrenador
            // Genera una fecha en los últimos 6 meses
            'fecha' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            
            // Genera un importe de factura entre 50.00 y 1000.00
            'importe' => $this->faker->randomFloat(2, 50, 1000), 
            
            // Estado de la factura
            'estado' => $this->faker->randomElement(['Pendiente', 'Pagada', 'Anulada']),
        ];
    }
}
