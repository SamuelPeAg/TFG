<?php

namespace Database\Factories;

// Importamos el modelo con su nombre con guion
use App\Models\Nomina_entrenador;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NominaEntrenadorFactory extends Factory
{
    /**
     * Vinculamos la fábrica al modelo exacto
     */
    protected $model = Nomina_entrenador::class;

    public function definition(): array
    {
        $estado = $this->faker->randomElement(['pagado', 'pendiente']);

        return [
            'user_id' => User::factory(),
            'mes' => $this->faker->numberBetween(1, 12),
            'anio' => 2024,
            'concepto' => $this->faker->randomElement(['Entrenamiento', 'Dieta', 'Asesoría']),
            'importe' => $this->faker->randomFloat(2, 500, 2500),
            'estado' => $estado,
            'fecha_pago' => $estado === 'pagado' ? $this->faker->dateTimeThisYear() : null,
            'archivo_path' => 'nominas/demo.pdf',
        ];
    }
}