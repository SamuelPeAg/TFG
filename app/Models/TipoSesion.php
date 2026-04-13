<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TipoSesion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tipos_sesion';

    protected $fillable = [
        'nombre',
        'slug',
        'capacidad_personas',
        'capacidad_fija',
        'precio_base',
        'color_hex',
        'activo',
        'orden',
        'descripcion',
        'centro_id',
        'horas_cancelacion_default',
    ];

    protected $casts = [
        'capacidad_personas' => 'integer',
        'capacidad_fija'     => 'boolean',
        'precio_base'        => 'decimal:2',
        'activo'             => 'boolean',
        'orden'              => 'integer',
        'horas_cancelacion_default' => 'integer',
    ];

    /**
     * Centro al que pertenece (null = global, disponible para todos).
     */
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }

    /**
     * Scope: solo tipos activos.
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope: globales (sin centro asignado).
     */
    public function scopeGlobales($query)
    {
        return $query->whereNull('centro_id');
    }

    /**
     * Scope: ordenados por el campo 'orden'.
     */
    public function scopeOrdenados($query)
    {
        return $query->orderBy('orden')->orderBy('nombre');
    }
}
