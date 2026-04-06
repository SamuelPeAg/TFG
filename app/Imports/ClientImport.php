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
        // En este excel, 'external_id' parece contener el nombre completo (ej: Jose Manuel B)
        // y 'firstname' contiene solo el nombre (ej: Jose Manuel).
        // Usamos el más completo que encontremos.
        $nombre = $row['external_id'] ?? $row['firstname'] ?? $row['nombre'] ?? $row['name'] ?? $row['cliente'] ?? null;
        
        if (!$nombre || empty($nombre)) {
            return null;
        }

        // 1. Clasificación: Centro (CENTRO en el excel)
        $centroName = $row['centro'] ?? $row['centro_'] ?? null;
        $centroId = null;
        if ($centroName) {
            $empresa = \App\Models\Empresa::first();
            $empresaId = $empresa ? $empresa->id : null;
            
            $centro = \App\Models\Centro::firstOrCreate([
                'nombre' => $centroName,
                'empresa_id' => $empresaId
            ]);
            $centroId = $centro->id;
        }

        // 2. Email (email en el excel)
        $email = $row['email'] ?? (str_replace(' ', '.', strtolower($nombre)) . '@factomove.es');

        // Buscar si ya existe por email o DNI para no duplicar
        $user = User::where('email', $email);
        if (isset($row['dni']) && !empty($row['dni'])) {
            $user = $user->orWhere('dni', $row['dni']);
        }
        $user = $user->first();

        // 3. Atributos adicionales (los de la imagen)
        $additional_attributes = [
            'external_id'   => $row['external_id'] ?? null,
            'firstname'     => $row['firstname'] ?? null,
            'birthday'      => $row['birthday'] ?? null,
            'mobile'        => $row['mobile'] ?? null,
            'phone'         => $row['phone'] ?? null,
            'member_since'  => $row['member_since'] ?? null,
        ];

        $data = [
            'name'          => $nombre,
            'email'         => $email,
            'dni'           => $row['dni'] ?? null,
            'direccion'     => $row['street'] ?? null,
            'centro_id'     => $centroId,
            'empresa_id'    => $empresaId ?? null,
            'additional_attributes' => $additional_attributes,
            'activo'        => true,
        ];

        if ($user) {
            $user->update($data);
            return null;
        }

        $user = new User($data);
        $user->password = Hash::make($row['contrasena'] ?? $row['password'] ?? '12345678');
        $user->activo = true; // Por defecto activos al importar
        $user->save();
        $user->assignRole('cliente');

        return $user;
    }
}
