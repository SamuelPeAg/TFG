<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoSesion;

class TiposSesionSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            [
                'nombre'            => 'EP (Personal)',
                'slug'              => 'ep_personal',
                'capacidad_personas'=> 1,
                'capacidad_fija'    => true,
                'precio_base'       => 0.00,
                'color_hex'         => '#4BB7AE',
                'activo'            => true,
                'orden'             => 1,
                'descripcion'       => 'Entrenamiento Personal. Sesión individual con el entrenador.',
                'centro_id'         => null,
            ],
            [
                'nombre'            => 'Dúo',
                'slug'              => 'duo',
                'capacidad_personas'=> 2,
                'capacidad_fija'    => true,
                'precio_base'       => 0.00,
                'color_hex'         => '#EF5D7A',
                'activo'            => true,
                'orden'             => 2,
                'descripcion'       => 'Sesión para dos personas.',
                'centro_id'         => null,
            ],
            [
                'nombre'            => 'Trío',
                'slug'              => 'trio',
                'capacidad_personas'=> 3,
                'capacidad_fija'    => true,
                'precio_base'       => 0.00,
                'color_hex'         => '#A5EFE2',
                'activo'            => true,
                'orden'             => 3,
                'descripcion'       => 'Sesión para tres personas, aforo fijo.',
                'centro_id'         => null,
            ],
            [
                'nombre'            => 'Privado',
                'slug'              => 'privado',
                'capacidad_personas'=> 1,
                'capacidad_fija'    => false,
                'precio_base'       => 0.00,
                'color_hex'         => '#959697',
                'activo'            => true,
                'orden'             => 4,
                'descripcion'       => 'Sesión privada con aforo configurable.',
                'centro_id'         => null,
            ],
            [
                'nombre'            => 'Grupo especial',
                'slug'              => 'grupo_especial',
                'capacidad_personas'=> 8,
                'capacidad_fija'    => false,
                'precio_base'       => 0.00,
                'color_hex'         => '#FFCE56',
                'activo'            => true,
                'orden'             => 5,
                'descripcion'       => 'Grupo reducido con tratamiento especial. Aforo editable.',
                'centro_id'         => null,
            ],
            [
                'nombre'            => 'Grupo',
                'slug'              => 'grupo',
                'capacidad_personas'=> 15,
                'capacidad_fija'    => false,
                'precio_base'       => 0.00,
                'color_hex'         => '#7C3AED',
                'activo'            => true,
                'orden'             => 6,
                'descripcion'       => 'Clase grupal estándar. Aforo editable por sesión.',
                'centro_id'         => null,
            ],
        ];

        foreach ($tipos as $tipo) {
            TipoSesion::updateOrCreate(
                ['slug' => $tipo['slug']],
                $tipo
            );
        }
    }
}
