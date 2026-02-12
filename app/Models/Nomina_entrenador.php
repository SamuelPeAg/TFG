<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nomina_entrenador extends Model
{
    use HasFactory;

    protected $table = 'nominas';

    protected $fillable = [
        'user_id', 
        'mes', 
        'anio', 
        'concepto', 
        'importe', 
        'estado_nomina', 
        'fecha_pago', 
        'archivo_path',
        'es_auto_generada',
        'detalles'
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'es_auto_generada' => 'boolean',
        'detalles' => 'array',
    ];

    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'user_id');
    }

    // Alias para mantener compatibilidad con vistas que usen $nomina->user
    public function user()
    {
        return $this->entrenador();
    }
}
