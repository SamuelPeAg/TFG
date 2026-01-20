<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sessiones>
 */
class SessionesFactory extends Factory
{
    public function definition(): array
    {
        $centros = ['CLINICA', 'AIRA', 'OPEN'];
        $metodosPago = ['TPV', 'BIZUM', 'TRANSFERENCIA']; // ajusta si tus opciones son otras

        return [
            'user_id' => User::factory(),

            // nuevos campos
            'centro' => $this->faker->randomElement($centros),
            'nombre_clase' => $this->faker->randomElement([
                'Pilates', 'Crossfit', 'Yoga', 'HIIT', 'Cardio'
            ]),
            'metodo_pago' => $this->faker->randomElement($metodosPago),

            // pago / iban
            'iban' => $this->faker->iban('ES'), // iban realista con letras
            'Pago' => $this->faker->randomFloat(2, 10, 80), // decimal 2 cifras

            // datetime (fecha + hora)
            'Fecharegistro' => $this->faker->dateTimeBetween('-2 months', 'now'),
        ];
    }
}
