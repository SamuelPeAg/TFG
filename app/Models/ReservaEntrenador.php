<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class ReservaEntrenador extends Authenticatable
{
    use HasFactory;

    // Modelo para la entidad 'Reserva_Entrenador' del ERD 
    protected $table = 'reserva_entrenador';
    protected $primaryKey = 'id';

    protected $fillable = [
        'hora_inicio',
        'hora_fin',
        'fecha',
        'disponible',
        'centro_id',
        'entrenador_id',
    ];

 

    /**
     * RELACIONES
     */

    // Relación N:1 'Tiene' -> Este Reserva pertenece a un Entrenador 
    function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id', 'id');
    }

    // Relación N:1 -> Este Reserva se ofrece en un Centro 
    function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id', 'id');
    }

    // Relación 1:N 'Tiene' -> Este Reserva puede tener N reservas 
    function reservas()
    {
        return $this->hasMany(Reserva::class, 'Reserva_entrenador_id', 'id');
    }
}