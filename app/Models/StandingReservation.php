<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StandingReservation extends Model
{
    protected $fillable = [
        'user_id',
        'nombre_clase',
        'tipo_clase',
        'centro',
        'dia_semana',
        'hora_inicio',
        'precio',
        'metodo_pago',
    ];
}
