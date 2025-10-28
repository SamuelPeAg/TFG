<?php

namespace App\Models;

use App\Models\HorarioClase;
use Illuminate\Foundation\Auth\User;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model 
{

    protected $table = 'reservas';
    
    protected $fillable = [
        'id_usuario',
        'id_horario_clase',
        'estado',
    ];

    //Una Reserva pertenece a un User 
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id');
    }

    // Una Reserva puede pertenecer a un Horario de Clase 
    public function horarioClase()
    {
        return $this->belongsTo(HorarioClase::class, 'id_horario_clase', 'id');
    }
}