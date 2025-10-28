<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Authenticatable 
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $table = 'usuarios';
    protected $primaryKey = 'id';

  
    protected $fillable = [
        'nombre',
        'email',
        'contraseña',
        'foto_de_perfil',
        'IBAN',
        'FirmaDigital',
    ];

    protected $hidden = [
        'contraseña',
        'remember_token',
    ];

   
    public function reservas(){
        return $this->hasMany(Reserva::class, 'id_usuario', 'id');
    }
}