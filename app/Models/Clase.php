<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clase extends Model
{
    protected $table = 'clases';

 protected $fillable = [
        'nombre',
        'descripcion',
        'duracion_minutos', 
        'nivel',
        'id_centro', 
    ];

  

    // Una Clase pertenece a un Centro 
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id', 'id');
    }

    //Una Clase es impartida por N Entrenadores 
    public function entrenadores()
    {
        return $this->belongsToMany(Entrenador::class, 'clase_entrenador', 'clase_id', 'entrenador_id');
    }

    //Una Clase tiene N HorariosClases
   public function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'clase_id', 'id');
    }
}