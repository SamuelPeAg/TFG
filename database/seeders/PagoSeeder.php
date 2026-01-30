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
        // Obtener usuarios clave
        $admin = User::where('email', 'admin@factomove')->first();
        $entrenador = User::where('email', 'entrenador@factomove')->first();

        // Si no existen, no hacer nada (o crearlos, pero RoleSeeder ya debería haber corrido)
        if (!$admin) return;

        // Crear Pagos para el ADMIN (ya que en la captura se usaba admin como entrenador)
        // Mes actual
        $this->crearPagos($admin, Carbon::now());
        // Mes pasado (para probar historial, si se quisiera)
        $this->crearPagos($admin, Carbon::now()->subMonth());

        if ($entrenador) {
            $this->crearPagos($entrenador, Carbon::now());
        }
    }

    private function crearPagos($user, $fechaBase)
    {
        // 5 pagos para este usuario en este mes
        for ($i = 0; $i < 5; $i++) {
            Pago::create([
                'user_id' => null, // Cliente opcional
                'entrenador_id' => $user->id,
                'centro' => 'Centro Principal',
                'nombre_clase' => 'Entrenamiento Personal',
                'metodo_pago' => 'Tarjeta',
                'iban' => 'ES1234567890123456789012',
                'importe' => rand(30, 100),
                'fecha_registro' => $fechaBase->copy()->day(rand(1, 28)), // Fecha aleatoria del mes
            ]);
        }
    }
}
