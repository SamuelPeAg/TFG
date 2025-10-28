<?php

namespace App\Models;

use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\FacturaEntrenador;
use App\Models\ReservaEntrenador;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Entrenador extends Model
{
    use Notifiable;
    
    protected $table = 'entrenadores';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nombre',
        'email',
    ];

    //Un Entrenador imparte N Clases (N:N)
    public function clases()
    {
        return $this->belongsToMany(Clase::class, 'clase_entrenador', 'entrenador_id', 'clase_id');
    }

    //Un Entrenador tiene N Facturas 
    public function facturas()
    {
        return $this->hasMany(FacturaEntrenador::class, 'id_entrenador', 'id');
    }

    //Un Entrenador imparte N Horarios (Instancias)
    public function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'id_entrenador', 'id');
    }

    //Un Entrenador tiene N franjas de disponibilidad
    public function disponibilidad()
    {
        return $this->hasMany(ReservaEntrenador::class, 'entrenador_id', 'id');
    }
}