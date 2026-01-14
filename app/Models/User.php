<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable; 
use Illuminate\Database\Eloquent\SoftDeletes;

// Importaciones correctas según tu imagen
use App\Models\UserGroup;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'foto_de_perfil',
        'IBAN',
        'FirmaDigital', 
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relación con Grupos
    public function groups()
    {
        // OJO: Asegúrate que en la base de datos la tabla se llame 'user_user_group'
        // Si te da error, prueba con 'group_user'
        return $this->belongsToMany(UserGroup::class, 'user_user_group');
    }

    // Relación con Sessiones (Coincide con tu archivo Sessiones.php)
    public function sesionesCreadas()
    {
        return $this->hasMany(\App\Models\Sessiones::class, 'entrenador_id');
    }
}