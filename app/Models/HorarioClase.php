<?php

namespace App\Models;

use App\Models\Clase;
use App\Models\Centro;
use App\Models\Reserva;
use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Model;

class HorarioClase extends Model
{

    protected $table = 'horarios_clases';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id_clase',
        'id_entrenador',
        'id_centro',
        'fecha_hora_inicio',
        'capacidad',
    ];
  
    // Esta instancia pertenece a un Tipo de Clase 
    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase', 'id');
    }

    //Esta instancia se da en un Centro 
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'id_centro', 'id');
    }

    // Esta instancia es impartida por un Entrenador
    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'id_entrenador', 'id');
    }

    // Esta instancia puede tener N Reservas
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_horario_clase', 'id');
    }
}