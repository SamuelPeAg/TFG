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

        // Crear roles básicos
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'cliente']);
        Role::firstOrCreate(['name' => 'entrenador']);
        
         $admin = User::firstOrCreate(
            ['email' => 'admin@factomove'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin12345'),
            ]
        );
        $adminjavi = User::firstOrCreate(
            ['email' => 'javier.ruiz@doc.medac.es'],
            [
                'name' => 'admin',
                'password' => Hash::make('password'),
            ]
        );
        
        $entrenador = User::firstOrCreate(
            ['email' => 'entrenador@factomove'],
            [
                'name' => 'entrenador',
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
