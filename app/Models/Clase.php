<?php

namespace App\Models;

use App\Models\Centro;
use App\Models\Entrenador;
use App\Models\HorarioClase;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clase extends Model
{
    use HasFactory;
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
        return $this->belongsTo(Centro::class, 'id_centro', 'id'); // FK 'id_centro'
    }

    //Una Clase tiene N HorariosClases (Instancias)
    public function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'id_clase', 'id'); // FK 'id_clase'
    }
}