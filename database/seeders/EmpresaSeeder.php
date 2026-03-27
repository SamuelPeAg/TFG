<?php
namespace Database\Seeders;

use App\Models\Empresa;
use Illuminate\Database\Seeder;

class EmpresaSeeder extends Seeder
{
    public function run(): void
    {
        Empresa::updateOrCreate(
            ['cif_dni' => 'B75272062'],
            [
                'nombre' => 'MDV SALUD Y EJERCICIO SL',
                'direccion' => 'Escritora Antonia Palacios 5 3-2',
                'cp' => '14012',
                'ciudad' => 'Córdoba',
                'iva_configurable' => 21
            ]
        );
        
        Empresa::updateOrCreate(
            ['cif_dni' => 'B72950207'],
            [
                'nombre' => 'MVD ANDALUCIA',
                'direccion' => 'C/Machaquito n26 4,3',
                'cp' => '14005',
                'ciudad' => 'Córdoba',
                'iva_configurable' => 0
            ]
        );
    }
}
