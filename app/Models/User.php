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

    protected $guard_name = 'web';

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

    /**
     * El modelo User ahora se utiliza exclusivamente para CLIENTES.
     */
    
    // Relación con sus pagos
    public function Pagos()
    {
        return $this->hasMany(Pago::class, 'user_id');
    }
}
