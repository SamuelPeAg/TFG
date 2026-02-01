<?php

use App\Models\User;
use App\Models\Entrenador;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

// Asegurarse de que el rol existe para el nuevo guard
if (!Role::where('name', 'admin')->where('guard_name', 'entrenador')->exists()) {
    Role::create(['name' => 'admin', 'guard_name' => 'entrenador']);
}
if (!Role::where('name', 'entrenador')->where('guard_name', 'entrenador')->exists()) {
    Role::create(['name' => 'entrenador', 'guard_name' => 'entrenador']);
}

// Obtener todos los usuarios que son admin o entrenador (usando el guard web por ahora)
$usersToMigrate = User::whereHas('roles', function($q) {
    $q->whereIn('name', ['admin', 'entrenador']);
})->get();

foreach ($usersToMigrate as $user) {
    echo "Migrando a {$user->name} ({$user->email})...\n";
    
    // Crear en la nueva tabla
    $entrenador = Entrenador::updateOrCreate(
        ['email' => $user->email],
        [
            'name' => $user->name,
            'password' => $user->password,
            'foto_de_perfil' => $user->foto_de_perfil,
            'iban' => $user->iban,
            'firma_digital' => $user->firma_digital,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]
    );

    // Asignar roles en el nuevo guard
    foreach ($user->roles as $role) {
        if ($role->name == 'admin' || $role->name == 'entrenador') {
            $entrenador->assignRole($role->name);
        }
    }

    echo "Migrado con éxito.\n";
}

echo "Proceso finalizado.\n";
