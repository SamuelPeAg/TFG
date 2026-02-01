<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear roles para el guard 'web' (clientes)
        Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);

        // Crear roles para el guard 'entrenador' (entrenadores y admins)
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'entrenador']);
        Role::firstOrCreate(['name' => 'entrenador', 'guard_name' => 'entrenador']);

        // Crear Admins en la tabla de entrenadores
        $admin = \App\Models\Entrenador::firstOrCreate(
            ['email' => 'admin@factomove'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin12345'),
                'email_verified_at' => now(),
            ]
        );

        $adminjavi = \App\Models\Entrenador::firstOrCreate(
            ['email' => 'javier.ruiz@doc.medac.es'],
            [
                'name' => 'javi',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Crear un Entrenador de prueba en la tabla de entrenadores
        $entrenador = \App\Models\Entrenador::firstOrCreate(
            ['email' => 'entrenador@factomove'],
            [
                'name' => 'entrenador',
                'password' => Hash::make('entrenador'),
                'email_verified_at' => now(),
            ]
        );

        // Asignar roles (Spatie detectará automáticamente el guard basado en el modelo Entrenador)
        $admin->syncRoles(['admin']);
        $adminjavi->syncRoles(['admin']);
        $entrenador->syncRoles(['entrenador']);
    }
}
