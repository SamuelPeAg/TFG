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

        // Crear roles básicos para guard web
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'entrenador', 'guard_name' => 'web']);

        // Crear roles para guard entrenador
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'entrenador']);
        Role::firstOrCreate(['name' => 'entrenador', 'guard_name' => 'entrenador']);

        $admin = \App\Models\Entrenador::firstOrCreate(
            ['email' => 'admin@factomove'],
            [
                'nombre' => 'admin',
                'password' => Hash::make('admin12345'),
            ]
        );
        $adminjavi = \App\Models\Entrenador::firstOrCreate(
            ['email' => 'javier.ruiz@doc.medac.es'],
            [
                'nombre' => 'javi',
                'password' => Hash::make('password'),
            ]
        );

        $entrenador = \App\Models\Entrenador::firstOrCreate(
            ['email' => 'entrenador@factomove'],
            [
                'nombre' => 'entrenador',
                'password' => Hash::make('entrenador'),
            ]
        );

        $entrenador->syncRoles(["entrenador"]);
        $admin->syncRoles(['admin']);
        $adminjavi->syncRoles(['admin']);
        // (Opcional) Crear permisos y asignarlos a roles si los necesitas
        // Permission::firstOrCreate(['name' => 'manage users']);
        // $role = Role::findByName('admin');
        // $role->givePermissionTo('manage users');
    }
}
