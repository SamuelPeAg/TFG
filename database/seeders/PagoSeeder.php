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
        $entrenadores = Entrenador::role('entrenador')->get();
        $admins = Entrenador::role('admin')->get();
        $profesores = $entrenadores->concat($admins);

        if ($profesores->isEmpty()) return;

        $clientes = User::role('cliente')->get();
        $centros = \App\Models\Centro::all();
        $clases = \App\Models\Clase::all();

        if ($centros->isEmpty() || $clases->isEmpty()) return;

        foreach ($profesores as $profe) {
            $this->crearPagosSemanales($profe, $clientes, $centros, $clases);
        }
    }

    private function crearPagosSemanales($entrenador, $clientes, $centros, $clases)
    {
        $tipoCredito = \App\Models\TipoCredito::where('nombre', 'Crédito Estándar')->first();
        
        // Crear 5 clases diarias para los últimos 30 días
        for ($i = -30; $i < 15; $i++) { // Desde hace 30 días hasta dentro de 2 semanas
            $fechaBase = Carbon::now()->addDays($i);
            
            for ($j = 0; $j < 5; $j++) { // 5 sesiones por día
                $centro = $centros->random();
                $clase = $clases->random();
                $hora = 9 + ($j * 4); // Clases a las 9:00, 13:00, 17:00 aprox

                $pago = Pago::create([
                    'user_id' => null, // Sesión abierta
                    'entrenador_id' => $entrenador->id,
                    'centro' => $centro->nombre,
                    'nombre_clase' => $clase->nombre,
                    'tipo_clase' => $clase->nombre,
                    'metodo_pago' => 'Sesión Calendario',
                    'iban' => $entrenador->iban ?? 'ES0000000000000000000000',
                    'importe' => 0,
                    'fecha_registro' => $fechaBase->copy()->hour($hora)->minute(0)->second(0),
                    'capacidad_maxima' => 15,
                    'horas_cancelacion' => 12
                ]);

                $pago->entrenadores()->sync([$entrenador->id]);
                if ($tipoCredito) $pago->tiposCredito()->sync([$tipoCredito->id]);

                // Añadir algunos alumnos a algunas clases para que no todas estén vacías
                if (rand(0, 1) === 0 && $clientes->isNotEmpty()) {
                    $asistentes = $clientes->random(rand(1, 4));
                    foreach ($asistentes as $ast) {
                        $pAst = Pago::create([
                            'user_id' => $ast->id,
                            'entrenador_id' => $entrenador->id,
                            'centro' => $centro->nombre,
                            'nombre_clase' => $clase->nombre,
                            'tipo_clase' => $clase->nombre,
                            'metodo_pago' => 'Bono',
                            'iban' => $ast->iban,
                            'importe' => 20,
                            'fecha_registro' => $pago->fecha_registro,
                            'capacidad_maxima' => 15,
                            'horas_cancelacion' => 12
                        ]);
                        $pAst->entrenadores()->sync([$entrenador->id]);
                        if ($tipoCredito) $pAst->tiposCredito()->sync([$tipoCredito->id]);
                    }
                }
            }
        }
    }
}
