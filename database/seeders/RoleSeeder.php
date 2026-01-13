<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear roles básicos
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'cliente']);
        Role::firstOrCreate(['name' => 'entrenador']);

        // (Opcional) Crear permisos y asignarlos a roles si los necesitas
        // Permission::firstOrCreate(['name' => 'manage users']);
        // $role = Role::findByName('admin');
        // $role->givePermissionTo('manage users');
    }
}
