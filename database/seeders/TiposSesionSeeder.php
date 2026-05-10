<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoSesion;

class TiposSesionSeeder extends Seeder
{
    public function run(): void
    {
        TipoSesion::query()->delete(); // Limpiamos los anteriores (Crossfit, etc.)

        $tipos = [
            [
                'nombre'            => 'EP',
                'slug'              => 'ep',
                'capacidad_personas'=> 1,
                'capacidad_fija'    => true,
                'precio_base'       => 1.00,
                'color_hex'         => '#8B5CF6', // Violeta
                'activo'            => true,
                'orden'             => 1,
                'descripcion'       => 'Entrenamiento Personal 1 a 1',
                'horas_cancelacion_default' => 24,
            ],
            [
                'nombre'            => 'DUO',
                'slug'              => 'duo',
                'capacidad_personas'=> 2,
                'capacidad_fija'    => true,
                'precio_base'       => 1.00,
                'color_hex'         => '#3B82F6', // Azul
                'activo'            => true,
                'orden'             => 2,
                'descripcion'       => 'Entrenamiento para 2 personas',
                'horas_cancelacion_default' => 24,
            ],
            [
                'nombre'            => 'TRIO',
                'slug'              => 'trio',
                'capacidad_personas'=> 3,
                'capacidad_fija'    => true,
                'precio_base'       => 1.00,
                'color_hex'         => '#10B981', // Verde
                'activo'            => true,
                'orden'             => 3,
                'descripcion'       => 'Entrenamiento para 3 personas',
                'horas_cancelacion_default' => 24,
            ],
            [
                'nombre'            => 'Grupo priv',
                'slug'              => 'grupo-priv',
                'capacidad_personas'=> 6,
                'capacidad_fija'    => false,
                'precio_base'       => 1.00,
                'color_hex'         => '#F59E0B', // Naranja
                'activo'            => true,
                'orden'             => 4,
                'descripcion'       => 'Grupo privado reducido',
                'horas_cancelacion_default' => 24,
            ],
        ];

        $tipoCredito = \App\Models\TipoCredito::where('nombre', 'Crédito Estándar')->first();

        foreach ($tipos as $tipoData) {
            $ts = TipoSesion::updateOrCreate(
                ['slug' => $tipoData['slug']],
                $tipoData
            );

            if ($tipoCredito) {
                $ts->tiposCredito()->syncWithoutDetaching([$tipoCredito->id]);
            }
        }
    }
}
