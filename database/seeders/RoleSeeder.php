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

        // Crear roles específicos por guard (Spatie requiere esto para multitable)
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'staff']);
        Role::firstOrCreate(['name' => 'entrenador', 'guard_name' => 'staff']);
        Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
        
        // Crear Staff de prueba (Admins y Entrenadores)
        $admin = \App\Models\Entrenador::withTrashed()->updateOrCreate(
            ['email' => 'admin@factomove.com'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin12345'),
                'deleted_at' => null,
            ]
        );
        $admin->syncRoles(['admin']);

        $adminjavi = \App\Models\Entrenador::withTrashed()->updateOrCreate(
            ['email' => 'javier.ruiz@doc.medac.es'],
            [
                'name' => 'javi',
                'password' => Hash::make('password'),
                'deleted_at' => null,
            ]
        );
        $adminjavi->syncRoles(['admin']);
        
        $entrenador = \App\Models\Entrenador::withTrashed()->updateOrCreate(
            ['email' => 'entrenador@factomove.com'],
            [
                'name' => 'entrenador',
                'password' => Hash::make('entrenador'),
                'deleted_at' => null,
            ]
        );
        $entrenador->syncRoles(["entrenador"]);
    }
}
