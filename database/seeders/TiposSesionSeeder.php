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
                'nombre'            => 'Crossfit',
                'slug'              => 'crossfit',
                'capacidad_personas'=> 15,
                'capacidad_fija'    => false,
                'precio_base'       => 1.00,
                'color_hex'         => '#EF4444', // Rojo
                'activo'            => true,
                'orden'             => 1,
                'descripcion'       => 'Entrenamiento funcional de alta intensidad.',
                'horas_cancelacion_default' => 2,
            ],
            [
                'nombre'            => 'Yoga',
                'slug'              => 'yoga',
                'capacidad_personas'=> 12,
                'capacidad_fija'    => false,
                'precio_base'       => 10.00,
                'color_hex'         => '#3B82F6', // Azul
                'activo'            => true,
                'orden'             => 2,
                'descripcion'       => 'Disciplina física y mental para el equilibrio.',
                'horas_cancelacion_default' => 4,
            ],
            [
                'nombre'            => 'Pilates',
                'slug'              => 'pilates',
                'capacidad_personas'=> 10,
                'capacidad_fija'    => false,
                'precio_base'       => 1.00,
                'color_hex'         => '#10B981', // Esmeralda
                'activo'            => true,
                'orden'             => 3,
                'descripcion'       => 'Entrenamiento físico centrado en el core y flexibilidad.',
                'horas_cancelacion_default' => 3,
            ],
            [
                'nombre'            => 'HIIT',
                'slug'              => 'hiit',
                'capacidad_personas'=> 20,
                'capacidad_fija'    => false,
                'precio_base'       => 1.00,
                'color_hex'         => '#F59E0B', // Ámbar
                'activo'            => true,
                'orden'             => 4,
                'descripcion'       => 'Entrenamiento de intervalos de alta intensidad.',
                'horas_cancelacion_default' => 1,
            ],
            [
                'nombre'            => 'Open Gym',
                'slug'              => 'open-gym',
                'capacidad_personas'=> 30,
                'capacidad_fija'    => false,
                'precio_base'       => 1.00,
                'color_hex'         => '#6B7280', // Gris
                'activo'            => true,
                'orden'             => 5,
                'descripcion'       => 'Uso libre del material e instalaciones.',
                'horas_cancelacion_default' => 0,
            ],
            [
                'nombre'            => 'Entrenamiento Personal',
                'slug'              => 'personal_training',
                'capacidad_personas'=> 1,
                'capacidad_fija'    => true,
                'precio_base'       => 1.00,
                'color_hex'         => '#8B5CF6', // Violeta
                'activo'            => true,
                'orden'             => 6,
                'descripcion'       => 'Sesión individual 1-a-1 con un entrenador certificado.',
                'horas_cancelacion_default' => 24,
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
