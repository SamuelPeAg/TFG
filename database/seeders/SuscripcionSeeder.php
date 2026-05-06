<?php

namespace Database\Seeders;

use App\Models\Suscripcion;
use App\Models\Centro;
use App\Models\TipoSesion;
use App\Models\TipoCredito;
use Illuminate\Database\Seeder;

class SuscripcionSeeder extends Seeder
{
    public function run(): void
    {
        $centro = Centro::first();
        $centroId = $centro ? $centro->id : null;
        $tipoSesion = TipoSesion::first();
        $tipoSesionId = $tipoSesion ? $tipoSesion->id : null;

        if (!$tipoSesionId) {
            // No hay tipos de sesión para crear suscripciones
            return;
        }

        // Crear un Tipo de Crédito Genérico
        $tipoCredito = TipoCredito::updateOrCreate(
            ['nombre' => 'Crédito Estándar'],
            ['id_centro' => null]
        );
        $tipoCredito->sesiones()->syncWithoutDetaching([$tipoSesionId]);

        $s1 = Suscripcion::updateOrCreate(
            ['nombre' => 'Suscripción Mensual'],
            [
                'id_centro' => $centroId,
                'periodo' => 'mensual',
                'precio' => 50.00,
                'limite_acumulacion' => 2,
                'meses_reset' => 1,
            ]
        );
        $s1->creditos()->delete();
        $s1->creditos()->create([
            'tipo_credito_id' => $tipoCredito->id,
            'cantidad' => 8,
            'dias_caducidad' => 30
        ]);

        $s2 = Suscripcion::updateOrCreate(
            ['nombre' => 'Suscripción Semanal'],
            [
                'id_centro' => $centroId,
                'periodo' => 'semanal',
                'precio' => 15.00,
                'limite_acumulacion' => 0,
                'meses_reset' => 0,
            ]
        );
        $s2->creditos()->create([
            'tipo_credito_id' => $tipoCredito->id,
            'cantidad' => 2,
            'dias_caducidad' => 7
        ]);

        // ASIGNAR SUSCRIPCIONES A CLIENTES EXISTENTES
        $clientes = \App\Models\User::role('cliente')->get();
        foreach ($clientes as $cliente) {
            $plan = rand(0, 1) === 0 ? $s1 : $s2;
            $userSub = \App\Models\SuscripcionUsuario::create([
                'id_usuario' => $cliente->id,
                'id_suscripcion' => $plan->id,
                'estado' => 'activo',
                'fecha_vencimiento_suscripcion' => now()->addMonth(),
                'dia_recarga' => now()->day,
            ]);

            // Darle los créditos iniciales
            foreach ($plan->creditos as $c) {
                $userSub->lotes()->create([
                    'tipo_credito_id' => $c->tipo_credito_id,
                    'cantidad_inicial' => $c->cantidad,
                    'cantidad_actual' => $c->cantidad,
                    'fecha_vencimiento' => now()->addDays($c->dias_caducidad),
                ]);
            }
        }
    }
}
