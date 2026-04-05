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
        $admin = Entrenador::withTrashed()->updateOrCreate(
            ['email' => 'admin@factomove'],
            [
                'name' => 'admin',
                'password' => Hash::make('password'),
                'deleted_at' => null,
            ]
        );
        $admin->syncRoles(['admin']);

        $adminjavi = Entrenador::withTrashed()->updateOrCreate(
            ['email' => 'javier.ruiz@doc.medac.es'],
            [
                'name' => 'javi',
                'password' => Hash::make('password'),
                'deleted_at' => null,
            ]
        );
        $adminjavi->syncRoles(['admin']);
        
        $entrenador = Entrenador::withTrashed()->updateOrCreate(
            ['email' => 'entrenador@factomove'],
            [
                'name' => 'entrenador',
                'password' => Hash::make('password'),
                'deleted_at' => null,
            ]
        );
        $entrenador->syncRoles(["entrenador"]);

        $cliente = User::withTrashed()->updateOrCreate(
            ['email' => 'cliente@factomove'],
            [
                'name' => 'cliente',
                'password' => Hash::make('password'),
                'deleted_at' => null,
            ]
        );
        $cliente->syncRoles(['cliente']);
        $cliente->restore();

        $cliente2 = User::withTrashed()->updateOrCreate(
            ['email' => 'spa0004@alu.medac.es'],
            [
                'name' => 'Samuel',
                'deleted_at' => null,
            ]
        );
        $cliente2->syncRoles(['cliente']);
        $cliente2->restore();
    }
}
