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
        'precio',
        'id_centro',
        'periodo',
        'limite_acumulacion',
        'meses_reset',
    ];

    /**
     * Relate each subscription to its optional Centro.
     */
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'id_centro');
    }

    public function usuarios()
    {
        return $this->hasMany(SuscripcionUsuario::class, 'id_suscripcion');
    }

    public function creditos()
    {
        return $this->hasMany(SuscripcionCredito::class, 'suscripcion_id');
    }
}
