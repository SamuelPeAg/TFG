<?php
namespace Database\Seeders;

use App\Models\Empresa;
use Illuminate\Database\Seeder;

class EmpresaSeeder extends Seeder
{
    public function run(): void
    {
        Empresa::create([
            'nombre' => 'Factomove S.L.',
            'cif_dni' => 'B12345678',
            'direccion' => 'Calle Principal 123',
            'cp' => '14001',
            'ciudad' => 'Córdoba',
            'iva_configurable' => 21
        ]);
        
        Empresa::create([
            'nombre' => 'Moverte da Vida Autónomo',
            'cif_dni' => '12345678Z',
            'direccion' => 'Avenida Secundaria 45',
            'cp' => '14002',
            'ciudad' => 'Córdoba',
            'iva_configurable' => 21
        ]);
    }
}
