<?php

namespace Database\Seeders;

use App\Models\Centro;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CentroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         $centros = [
            ['nombre' => 'Centro Fitness Central', 'direccion' => 'Calle Mayor 123'],
            ['nombre' => 'Centro Deportivo Norte', 'direccion' => 'Avenida del Norte 45'],
            ['nombre' => 'Gimnasio Sur', 'direccion' => 'Plaza Sur 12'],
            ['nombre' => 'Fitness & Wellness', 'direccion' => 'Calle Salud 7'],
            ['nombre' => 'Centro Atlético Este', 'direccion' => 'Avenida Este 89'],
        ];

        foreach ($centros as $centro) {
            Centro::create($centro);
            
        }
    }
}
