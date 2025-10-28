<?php

namespace App\Models;


use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacturaEntrenador extends Authenticatable
{
    use HasFactory;

    protected $table = 'facturas_entrenador';
    protected $primaryKey = 'id';

    protected $fillable = [
        'fecha',
        'importe',
        'estado',
        'entrenador_id',
    ];

    /**
     * RELACIONES
     */

    // Relación N:1 'Tiene' -> Una Factura pertenece a un Entrenador 
    function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id', 'id');
    }
}