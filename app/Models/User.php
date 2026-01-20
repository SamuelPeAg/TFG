<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'foto_de_perfil',
        'iban',
        'firma_digital',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function groups()
    {
        return $this->belongsToMany(UserGroup::class, 'user_user_group');
    }

    public function sesionesCreadas()
    {
        return $this->hasMany(Sessiones::class, 'entrenador_id');
    }

    public function horariosComoEntrenador()
    {
        return $this->hasMany(HorarioClase::class, 'entrenador_id');
    }
}
