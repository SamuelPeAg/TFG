<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nomina extends Model
{
    use HasFactory;

    // Nombre de la tabla (opcional si sigues la convención, pero recomendable)
    protected $table = 'nominas';

    // Campos que permitimos rellenar masivamente (Mass Assignment)
    // Esto es vital para que funcione el Nomina::create(...) del controlador
    protected $fillable = [
        'user_id',
        'fecha_emision',
        'importe',
        'concepto',
        'archivo_path',
    ];

    // Conversión automática de tipos
    protected $casts = [
        'fecha_emision' => 'date',   // Para poder usar ->format('d-m-Y') directamente
        'importe'       => 'decimal:2',
    ];

    /**
     * Relación: Una nómina pertenece a un Usuario (Entrenador).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}