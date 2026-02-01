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
        'name',
        'email',
        'password',
        'activation_token',
        'foto_de_perfil',
        'iban',
        'firma_digital',
        'signature_path',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Relación con los pagos/sesiones que ha creado o en las que participa.
     */
    public function PagosCreadas()
    {
        return $this->hasMany(Pago::class, 'entrenador_id');
    }

    /**
     * Relación con el horario de clases.
     */
    public function horariosComoEntrenador()
    {
        return $this->hasMany(HorarioClase::class, 'entrenador_id');
    }
}
