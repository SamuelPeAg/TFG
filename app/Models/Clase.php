<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clase extends Model
class Clase extends Model
{
    protected $table = 'clases';

    protected $fillable = [
        'nombre',
        'descripcion',
        'duracion',
        'nivel',
        'max_plazas',
        'centro_id',
    ];

    /**
     * RELACIONES
     */

    // Relación N:1 'Impartir' -> Una Clase pertenece a un Centro 
    function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id', 'id');
    }

    // Relación N:N 'Tiene' -> Una Clase es impartida por N Entrenadores 
    function entrenadores()
    {
        return $this->belongsToMany(Entrenador::class, 'clase_entrenador', 'clase_id', 'entrenador_id');
    }

    // Relación 1:N -> Una Clase (tipo) tiene N Instancias programadas (HorariosClases) 
    function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'clase_id', 'id');
    }
}