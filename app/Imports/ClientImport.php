<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\Importable;

class ClientImport implements ToModel, WithHeadingRow
{
    use Importable;

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Si el email está vacío, saltamos la fila
        if (!isset($row['email']) || empty($row['email'])) {
            return null;
        }

        // Si ya existe un usuario con ese email, podríamos saltarlo o actualizarlo.
        // Por seguridad, vamos a saltarlo para evitar sobreescribir datos accidentalmente.
        if (User::where('email', $row['email'])->exists()) {
            return null;
        }

        $user = new User([
            'name'          => $row['nombre'] ?? $row['name'] ?? 'Sin Nombre',
            'email'         => $row['email'],
            'password'      => Hash::make($row['contrasena'] ?? $row['password'] ?? '12345678'),
            'dni'           => $row['dni'] ?? null,
            'iban'          => $row['iban'] ?? null,
            'precio_hora'   => $row['precio_hora'] ?? 0,
            'direccion'     => $row['direccion'] ?? null,
            'ciudad'        => $row['ciudad'] ?? null,
            'codigo_postal' => $row['codigo_postal'] ?? null,
        ]);

        // Guardamos manualmente para poder asignar el rol justo después
        $user->save();
        $user->assignRole('cliente');

        return $user;
    }
}
