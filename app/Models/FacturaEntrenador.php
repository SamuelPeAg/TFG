<?php

namespace App\Models;

use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Model;

class FacturaEntrenador extends Model
{

    protected $table = 'factura_entrenador'; // Corregido
    protected $primaryKey = 'id';

    protected $fillable = [
        'entrenador_id',
        'fecha',
        'importe',
        'estado',
    ];

    // Una Factura pertenece a un Entrenador 
    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id', 'id');
    }
}