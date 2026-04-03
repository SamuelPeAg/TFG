<?php

namespace Database\Seeders;

use App\Models\Suscripcion;
use App\Models\Centro;
use Illuminate\Database\Seeder;

class SuscripcionSeeder extends Seeder
{
    public function run(): void
    {
        $centro = Centro::first();
        $centroId = $centro ? $centro->id : null;

        Suscripcion::updateOrCreate(
            ['nombre' => 'Suscripción Mensual'],
            [
                'tipo_credito' => 'Clases',
                'id_centro' => $centroId,
                'creditos_por_periodo' => 8,
                'periodo' => 'mensual',
                'precio' => 50.00,
                'limite_acumulacion' => 2,
                'meses_reset' => 1,
            ]
        );

        Suscripcion::updateOrCreate(
            ['nombre' => 'Suscripción Semanal'],
            [
                'tipo_credito' => 'Clases',
                'id_centro' => $centroId,
                'creditos_por_periodo' => 2,
                'periodo' => 'semanal',
                'precio' => 15.00,
                'limite_acumulacion' => 0,
                'meses_reset' => 0,
            ]
        );
    }
}
