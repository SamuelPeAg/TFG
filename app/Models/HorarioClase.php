<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class HorarioClase extends Model
{
    use HasFactory;

    protected $table = 'horarios_clases';
    protected $primaryKey = 'id';

    protected $fillable = [
        'fecha',
        'hora',
        'lugar',
        'tipo_sesion',
        'capacidad',
    ];

  
    // Esta instancia pertenece a un Tipo de Clase 
    public function clase()
    {
        return $this->belongsTo(Clase::class, 'clase_id', 'id');
    }

    //Esta instancia se da en un Centro 
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id', 'id');
    }

    // Esta instancia puede tener N Reservas
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'horario_clase_id', 'id');
    }
}