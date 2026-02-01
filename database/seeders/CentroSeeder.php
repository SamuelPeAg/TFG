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
            [
                'nombre' => 'Aira', 
                'direccion' => 'Av. de Rabanales, s/n, Levante, 14007 Córdoba',
                'google_maps_link' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12594.463651533495!2d-4.780209212841773!3d37.89266410000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6cdf7288300331%3A0x1bd6b7761e69d9a9!2sMoverte%20da%20vida%20-%20Aira%20fitness%20club!5e0!3m2!1ses!2ses!4v1768325180952!5m2!1ses!2ses'
            ],
            [
                'nombre' => 'Open Arena', 
                'direccion' => 'C. Escritora Maria Goyri, s/n, 14005 Córdoba',
                'google_maps_link' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d21986110736b%3A0xd2b686fab1dd9bb5!2sMoverte%20da%20Vida%20-%20Open%20Arena!5e0!3m2!1ses!2ses!4v1768325263249!5m2!1ses!2ses'
            ],
            [
                'nombre' => 'Clinica', 
                'direccion' => 'C. José Dámaso "Pepete", Poniente Sur, 14005 Córdoba',
                'google_maps_link' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12596.662396816844!2d-4.821452712841789!3d37.879809800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d210ee12d99e3%3A0x2e64896407139591!2sMoverte%20da%20vida%20-%20centro%20de%20salud%20y%20ejercicio!5e0!3m2!1ses!2ses!4v1768326010698!5m2!1ses!2ses'
            ],
        ];

        foreach ($centros as $centro) {
            Centro::create($centro);
        }
    }
}