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

    public function model(array $row)
    {
        // El nombre es la clave principal en este formato
        $nombre = $row['cliente'] ?? $row['nombre'] ?? $row['name'] ?? null;
        
        if (!$nombre || empty($nombre)) {
            return null;
        }

        // 1. Clasificación: Empresa
        $empresaName = $row['empresa'] ?? null;
        $empresaId = null;
        if ($empresaName) {
            $empresa = \App\Models\Empresa::firstOrCreate(['nombre' => $empresaName]);
            $empresaId = $empresa->id;
        }

        // 2. Clasificación: Centro
        $centroName = $row['centro'] ?? null;
        $centroId = null;
        if ($centroName) {
            $centro = \App\Models\Centro::firstOrCreate([
                'nombre' => $centroName,
                'empresa_id' => $empresaId
            ]);
            $centroId = $centro->id;
        }

        // 3. Email (necesario para el modelo User)
        // Si no viene en el excel, generamos uno determinista basado en el nombre
        $email = $row['email'] ?? (str_replace(' ', '.', strtolower($nombre)) . '@factomove.es');

        // Buscar si ya existe por nombre o email para no duplicar
        $user = User::where('name', $nombre)->orWhere('email', $email)->first();

        $data = [
            'name'          => $nombre,
            'email'         => $email,
            'empresa_id'    => $empresaId,
            'centro_id'     => $centroId,
            'precio_hora'   => $row['precio'] ?? $row['precio_hora'] ?? 0,
            'additional_attributes' => [
                'metodo_pago' => $row['pago'] ?? null,
                'servicio'    => $row['servicio'] ?? null,
                'entrenador'  => $row['entrenador'] ?? null,
                'mes_referencia' => $row['mes'] ?? null,
                'fecha_ultimo_excel' => $row['fecha'] ?? null
            ]
        ];

        if ($user) {
            $user->update($data);
            return null;
        }

        $user = new User($data);
        $user->password = Hash::make($row['contrasena'] ?? $row['password'] ?? '12345678');
        $user->save();
        $user->assignRole('cliente');

        return $user;
    }
}
