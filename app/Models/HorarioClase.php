<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class HorarioClase extends Authenticatable
{
    use HasFactory;

    // Modelo para la entidad 'HorariosClases' del ERD 
    protected $table = 'horarios_clases';
    protected $primaryKey = 'id';

    protected $fillable = [
        'fecha',
        'hora',
        'lugar',
        'tipo_sesion',
        'capacidad',
    ];

    /**
     * RELACIONES
     */

    // Relación N:1 -> Esta instancia pertenece a un Tipo de Clase 
    function clase()
    {
        return $this->belongsTo(Clase::class, 'clase_id', 'id');
    }

    // Relación N:1 -> Esta instancia se da en un Centro 
    function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id', 'id');
    }

    // Relación 1:N -> Esta instancia puede tener N Reservas
    function reservas()
    {
        return $this->hasMany(Reserva::class, 'horario_clase_id', 'id');
    }
}