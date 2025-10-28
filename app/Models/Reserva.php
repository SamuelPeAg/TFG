<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Reserva extends Model 
{
   use HasFactory;

    protected $table = 'reservas';
    protected $fillable = [
      'id_usuario',
        'fecha',
        'hora', 
        'estado',
        'id_clase', 
        'id_reserva_entrenador', 
    ];

    

 

    //Una Reserva pertenece a un Usuario 
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id');
    }

    // Una Reserva puede pertenecer a un Horario de Clase 
    public function horarioClase()
    {
        return $this->belongsTo(HorarioClase::class, 'horario_clase_id', 'id');
    }

    // Una Reserva puede pertenecer a un Reserva de Entrenador 
    public function ReservaEntrenador()
    {
        return $this->belongsTo(ReservaEntrenador::class, 'reserva_entrenador_id', 'id');
    }
}