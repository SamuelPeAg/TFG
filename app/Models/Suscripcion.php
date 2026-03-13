<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suscripcion extends Model
{
    use HasFactory;

    protected $table = 'suscripciones';

    protected $fillable = [
        'nombre',
        'tipo_credito',
        'id_centro',
        'creditos_por_periodo',
        'periodo',
        'limite_acumulacion',
        'meses_reset'
    ];

    public function centro()
    {
        return $this->belongsTo(Centro::class, 'id_centro');
    }

    public function suscripcionesUsuarios()
    {
        return $this->hasMany(SuscripcionUsuario::class, 'id_suscripcion');
    }
}
