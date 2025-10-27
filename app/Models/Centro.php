<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Centro extends Authenticatable
{
    use HasFactory;

    protected $table = "centros";
    protected $primaryKey = "id";

    protected $fillable = [
        "nombre",
        "direccion"
    ];

    /**
     * RELACIONES
     */

    // Relación 1:N 'Impartir' -> Un Centro tiene N Clases (tipos) 
    function clases()
    {
        return $this->hasMany(Clase::class, 'centro_id', 'id');
    }

    // Relación 1:N -> Un Centro tiene N HorariosClases (instancias) 
    function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'centro_id', 'id');
    }

}