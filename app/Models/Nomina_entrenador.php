<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Importamos la Factory con su nombre correcto
use Database\Factories\NominaEntrenadorFactory; 

class Nomina_entrenador extends Model
{
    use HasFactory;

    // 1. Definimos la tabla (para evitar errores de plurales)
    protected $table = 'nominas'; 

    protected $fillable = [
        'user_id', 'mes', 'anio', 'concepto', 
        'importe', 'estado', 'fecha_pago', 'archivo_path'
    ];

    protected $casts = [
        'fecha_pago' => 'date',
    ];

    /**
     * 2. VINCULACIÓN MANUAL:
     * "Mi fábrica no se llama Nomina_entrenadorFactory, 
     * se llama NominaEntrenadorFactory".
     */
    protected static function newFactory()
    {
        return NominaEntrenadorFactory::new();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}