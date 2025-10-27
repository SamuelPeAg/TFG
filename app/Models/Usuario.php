<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    protected $table = 'usuarios';
    protected $primaryKey = 'id';


    protected $fillable = [
        'nombre',
        'email',
        'contraseña',
        'foto_perfil',
        'IBAN',
        'fecha_registro',
        'firma_digital',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'contraseña',
        'remember_token',
    ];

   function reservas(){
    return $this->hasMany(Reserva::class, 'usuario_id', 'id');
   }
}
