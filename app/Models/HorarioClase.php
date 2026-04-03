<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HorarioClase extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'horarios_clases';

    protected $fillable = [
        'clase_id',
        'entrenador_id',
        'centro_id',
        'fecha_hora_inicio',
        'capacidad',
    ];

    protected $casts = [
        'fecha_hora_inicio' => 'datetime',
        'capacidad' => 'integer',
    ];

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'clase_id');
    }

    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id');
    }

    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }
}
