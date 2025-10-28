<?php

namespace Database\Seeders;

use App\Models\Centro;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CentroSeeder extends Seeder
{
    public function run(): void
    {
         $centros = [
            ['nombre' => 'Centro Fitness Central', 'direccion' => 'Calle Mayor 123'],
            ['nombre' => 'Centro Deportivo Norte', 'direccion' => 'Avenida del Norte 45'],
            ['nombre' => 'Gimnasio Sur', 'direccion' => 'Plaza Sur 12'],
        ];

        // Asumimos que los IDs serán 1, 2, 3...
        foreach ($centros as $centro) {
            Centro::create($centro);
        }
    }
}