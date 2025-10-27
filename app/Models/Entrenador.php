<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Entrenador extends Authenticatable
{
    use HasFactory;
    
    protected $table = 'entrenadores';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nombre',
        'email',
    ];

    /**
     * RELACIONES
     */

    // Relación N:N 'Tiene' -> Un Entrenador imparte N Clases 
    function clases()
    {
        return $this->belongsToMany(Clase::class, 'clase_entrenador', 'entrenador_id', 'clase_id');
    }

    // Relación 1:N 'Tiene' -> Un Entrenador tiene N Facturas 
    function facturas()
    {
        return $this->hasMany(FacturaEntrenador::class, 'entrenador_id', 'id');
    }


}