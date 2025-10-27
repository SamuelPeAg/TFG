<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Reserva extends Authenticatable 
{
    use HasFactory;

    protected $table = 'reservas';
    protected $primaryKey = 'id';

    protected $fillable = [
        'fecha',
        'estado',
        'usuario_id',
        'horario_clase_id', // Reserva de clase
        'reserva_entrenador_id', // Reserva de entrenador
    ];

    /**
     * RELACIONES
     */

    // Relación N:1 'Realizar' -> Una Reserva pertenece a un Usuario 
    function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id');
    }

    // Relación N:1 'Tener' -> Una Reserva puede pertenecer a una Instancia de Clase 
    function horarioClase()
    {
        return $this->belongsTo(HorarioClase::class, 'horario_clase_id', 'id');
    }

    // Relación N:1 'Tiene' -> Una Reserva puede pertenecer a un Reserva de Entrenador 
    function ReservaEntrenador()
    {
        return $this->belongsTo(ReservaEntrenador::class, 'reserva_entrenador_id', 'id');
    }
}