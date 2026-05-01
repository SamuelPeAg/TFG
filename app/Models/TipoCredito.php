<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoCredito extends Model
{
    protected $table = 'tipos_credito';

    protected $fillable = [
        'nombre',
        'id_centro',
    ];

    public function centro()
    {
        return $this->belongsTo(Centro::class, 'id_centro');
    }

    public function sesiones()
    {
        return $this->belongsToMany(TipoSesion::class, 'tipo_credito_sesiones', 'tipo_credito_id', 'tipo_sesion_id');
    }
}
