<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificacionEntrenador extends Model
{
    protected $table = 'notificacion_entrenadors';
    protected $fillable = ['entrenador_id', 'titulo', 'mensaje', 'tipo', 'leido', 'respuesta', 'fecha_respuesta'];

    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id');
    }
}
