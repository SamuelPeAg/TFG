<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Entrenador;

class SyncEntrenadoresSeeder extends Seeder
{
    public function run()
    {
        $users = User::role('entrenador')->get();

        foreach ($users as $u) {
            Entrenador::updateOrCreate(
                ['email' => $u->email],
                [
                    'nombre' => $u->name,
                    'email' => $u->email,
                    'iban' => $u->IBAN ?? null,
                    'password' => $u->password ?? bcrypt('password'),
                    'rol' => 'entrenador',
                ]
            );
        }
    }
}
