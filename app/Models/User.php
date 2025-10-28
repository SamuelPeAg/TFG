<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relación 1:1 con el perfil de usuario.
     */
    public function perfil()
    {
        return $this->hasOne(Usuario::class, 'user_id');
    }

    /**
     * El User (no el perfil) es quien hace las reservas.
     */
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_usuario');
    }
}