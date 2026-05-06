<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pago;
use App\Models\User;
use App\Models\Entrenador;
use Carbon\Carbon;

class PagoSeeder extends Seeder
{
    public function run()
    {
        // Obtener todos los entrenadores y admins
        $entrenadores = Entrenador::role('entrenador')->get();
        $admins = Entrenador::role('admin')->get();
        $profesores = $entrenadores->concat($admins);

        if ($profesores->isEmpty()) return;

        $clientes = User::role('cliente')->get();
        $centros = \App\Models\Centro::all();
        $clases = \App\Models\Clase::all();

        if ($centros->isEmpty() || $clases->isEmpty()) return;

        foreach ($profesores as $profe) {
            $this->crearPagos($profe, Carbon::now(), $clientes, $centros, $clases);
            $this->crearPagos($profe, Carbon::now()->subMonth(), $clientes, $centros, $clases);
        }
    }

    private function crearPagos($entrenador, $fechaBase, $clientes, $centros, $clases)
    {
        $tipoCredito = \App\Models\TipoCredito::first();

        // 8 sesiones aleatorias por mes
        for ($i = 0; $i < 8; $i++) {
            $esSesionVacia = rand(0, 1) === 0;
            $cliente = (!$esSesionVacia && $clientes->isNotEmpty()) ? $clientes->random() : null;
            $centro = $centros->random();
            $clase = $clases->random();

            $pago = Pago::create([
                'user_id' => $cliente ? $cliente->id : null,
                'entrenador_id' => $entrenador->id,
                'centro' => $centro->nombre,
                'nombre_clase' => $clase->nombre,
                'tipo_clase' => $clase->nombre,
                'metodo_pago' => $esSesionVacia ? 'Sesión Calendario' : collect(['Tarjeta', 'Efectivo', 'Transferencia'])->random(),
                'iban' => $entrenador->iban ?? 'ES0000000000000000000000',
                'importe' => $esSesionVacia ? 0 : rand(20, 60),
                'fecha_registro' => $fechaBase->copy()->day(rand(1, 28))->hour(rand(8, 20))->minute(0),
                'capacidad_maxima' => 15,
                'horas_cancelacion' => 12
            ]);

            // Sincronizar entrenador en la pivot (INDISPENSABLE PARA PODER ELIMINARLO)
            $pago->entrenadores()->sync([$entrenador->id]);
            // Sincronizar créditos para que sea canjeable
            if ($tipoCredito) $pago->tiposCredito()->sync([$tipoCredito->id]);
        }
    }
}
