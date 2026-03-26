<?php
namespace Database\Seeders;

use App\Models\Empresa;
use Illuminate\Database\Seeder;

class EmpresaSeeder extends Seeder
{
    public function run(): void
    {
        Empresa::updateOrCreate(
            ['cif_dni' => 'B12345678'],
            [
                'nombre' => 'Factomove S.L.',
                'direccion' => 'Calle Principal 123',
                'cp' => '14001',
                'ciudad' => 'Córdoba',
                'iva_configurable' => 21
            ]
        );
        
        Empresa::updateOrCreate(
            ['cif_dni' => '12345678Z'],
            [
                'nombre' => 'Moverte da Vida Autónomo',
                'direccion' => 'Avenida Secundaria 45',
                'cp' => '14002',
                'ciudad' => 'Córdoba',
                'iva_configurable' => 21
            ]
        );
    }
}
