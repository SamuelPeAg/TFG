<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Entrenador;

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
        $admin = Entrenador::updateOrCreate(
            ['email' => 'admin@factomove'],
            [
                'name' => 'admin',
                'password' => Hash::make('password'),
                'activo' => true,
            ]
        );
        $admin->syncRoles(['admin']);

        $adminjavi = Entrenador::updateOrCreate(
            ['email' => 'javier.ruiz@doc.medac.es'],
            [
                'name' => 'javi',
                'password' => Hash::make('password'),
                'activo' => true,
            ]
        );
        $adminjavi->syncRoles(['admin']);
        
        $entrenador = Entrenador::updateOrCreate(
            ['email' => 'entrenador@factomove'],
            [
                'name' => 'entrenador',
                'password' => Hash::make('password'),
                'activo' => true,
            ]
        );
        $entrenador->syncRoles(["entrenador"]);

        $cliente = User::updateOrCreate(
            ['email' => 'cliente@factomove'],
            [
                'name' => 'cliente',
                'password' => Hash::make('password'),
                'activo' => true,
            ]
        );
        $cliente->syncRoles(['cliente']);
    }
}
