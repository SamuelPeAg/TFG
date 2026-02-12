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

    // Aquí añadimos 'activation_token' al array $fillable
    protected $fillable = [
        'name',
        'email',
        'password',
        'activation_token',  // Agregado para el token de activación
        'foto_de_perfil',
        'iban',
        'firma_digital',
    ];

    // Campos ocultos que no queremos exponer al usuario
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Si deseas castear algún campo, como la fecha de verificación del correo
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    
    public function PagosCreadas()
    {
        return $this->hasMany(Pago::class, 'entrenador_id');
    }

    // Relación de uno a muchos con HorarioClase (si el usuario es entrenador)
    public function horariosComoEntrenador()
    {
        return $this->hasMany(HorarioClase::class, 'entrenador_id');
    }
}
