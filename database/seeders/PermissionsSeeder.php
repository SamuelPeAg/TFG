<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create specific permissions for staff guard
        $permissions = [
            'acceder_nominas_admin',
            'acceder_facturacion',
            'crear_clases',
            'acceder_suscripciones',
            'acceder_estadisticas'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'staff']);
        }

        // Ensure admin has all permissions
        $adminRole = Role::where('name', 'admin')->where('guard_name', 'staff')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($permissions);
        }
    }
}
