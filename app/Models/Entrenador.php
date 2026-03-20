<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;

class Entrenador extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable, HasRoles;

    protected $table = 'entrenadores';

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'activation_token',
        'foto_de_perfil',
        'iban',
    ];

    /**
     * Alias para 'nombre' para compatibilidad con vistas genéricas.
     */
    public function getNameAttribute()
    {
        return $this->nombre;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['nombre'] = $value;
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function PagosCreadas()
    {
        return $this->hasMany(Pago::class, 'entrenador_id');
    }

    public function horariosComoEntrenador()
    {
        return $this->hasMany(HorarioClase::class, 'entrenador_id');
    }
}
