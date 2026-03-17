<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SuscripcionUsuario;

class RenewSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'suscripciones:renovar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Renueva los créditos de los usuarios según el periodo de su suscripción (Semanal/Mensual).';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hoy = now();
        // Para automatizar: En producción esto correría cada medianoche.
        $isDomingo = $hoy->isSunday();
        $isPrimeroDeMes = ($hoy->day === 1);

        $suscripcionesActivas = SuscripcionUsuario::where('estado', 'activo')->with('suscripcion')->get();

        foreach ($suscripcionesActivas as $su) {
            $periodo = $su->suscripcion->periodo;
            
            $debeRenovar = false;
            if ($periodo === 'semanal' && $isDomingo) $debeRenovar = true;
            if ($periodo === 'mensual' && $isPrimeroDeMes) $debeRenovar = true;

            if ($debeRenovar) {
                // Lógica de reset (caducidad)
                $mesesReset = $su->suscripcion->meses_reset;
                if ($mesesReset > 0) {
                    $fechaLimite = $hoy->copy()->subMonths($mesesReset);
                    // Si nunca se ha reseteado o la última vez fue hace más del tiempo de caducidad
                    if (!$su->ultimo_reset || $su->ultimo_reset->lt($fechaLimite)) {
                        $su->saldo_actual = 0; // Se pierden los créditos antiguos
                        $su->ultimo_reset = $hoy;
                    }
                }

                // Lógica de acumulación
                $creditosDar = $su->suscripcion->creditos_por_periodo;
                $limite = $su->suscripcion->limite_acumulacion;
                
                $nuevoSaldo = $su->saldo_actual + $creditosDar;
                
                if ($limite > 0 && $nuevoSaldo > $limite) {
                    $nuevoSaldo = $limite;
                }

                $su->update([
                    'saldo_actual' => $nuevoSaldo,
                    'ultima_recarga' => $hoy
                ]);
            }
        }
        
        $this->info('Proceso de renovación de suscripciones finalizado.');
    }
}
