<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pago;
use App\Models\User;
use Carbon\Carbon;

class PagoSeeder extends Seeder
{
    public function run()
    {
        // Obtener todos los entrenadores
        $entrenadores = User::role('entrenador')->get();
        // Obtener el admin (que a veces actúa como entrenador)
        $admin = User::role('admin')->first();
        
        // Combina para tener una lista de posibles "profesores"
        $profesores = $entrenadores->concat($admin ? collect([$admin]) : collect([]));

        if ($profesores->isEmpty()) {
            return;
        }

        // Obtener clientes, centros y clases para que los datos sean reales
        $clientes = User::role('cliente')->get();
        $centros = \App\Models\Centro::all();
        $clases = \App\Models\Clase::all();

        // Si no hay datos suficientes, creamos algunos básicos por si acaso
        if ($centros->isEmpty()) return;
        if ($clases->isEmpty()) return;

        foreach ($profesores as $profe) {
            // Generar datos para los últimos 6 meses
            for ($i = 0; $i < 6; $i++) {
                $this->crearPagos($profe, Carbon::now()->subMonths($i), $clientes, $centros, $clases);
            }
        }
    }

    private function crearPagos($entrenador, $fechaBase, $clientes, $centros, $clases)
    {
        // 8 pagos aleatorios para este entrenador en este mes
        for ($i = 0; $i < 8; $i++) {
            $cliente = $clientes->isNotEmpty() ? $clientes->random() : null;
            $centro = $centros->random();
            $clase = $clases->random();

            Pago::create([
                'user_id' => $cliente ? $cliente->id : null,
                'entrenador_id' => $entrenador->id,
                'centro' => $centro->nombre,
                'nombre_clase' => $clase->nombre,
                'tipo_clase' => collect(['EP', 'DUO', 'TRIO', 'GRUPO'])->random(),
                'metodo_pago' => collect(['Tarjeta', 'Efectivo', 'Transferencia'])->random(),
                'iban' => $entrenador->iban ?? 'ES0000000000000000000000',
                'importe' => rand(20, 60),
                'fecha_registro' => $fechaBase->copy()->day(rand(1, 28))->hour(rand(8, 20))->minute(0),
            ]);
        }
    }
}
