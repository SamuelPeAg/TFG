<?php

namespace Database\Factories;

use App\Models\User; // Añadido
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UsuarioFactory extends Factory
{
    use HasFactory;
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            // Asignará un 'user_id' nuevo si no se lo pasas
            'user_id' => User::factory(), 
            'foto_de_perfil' => $this->faker->imageUrl(400, 400, 'people'),
            'IBAN' => $this->faker->iban('ES'),
            'FirmaDigital' => $this->faker->text(50),
        ];
    }
}