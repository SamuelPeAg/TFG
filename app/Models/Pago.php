<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pagos';

    protected $fillable = [
        'user_id',
        'entrenador_id',
        'centro',
        'nombre_clase',
        'tipo_clase',
        'capacidad_maxima',
        'metodo_pago',
        'iban',
        'importe',
        'fecha_registro',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'importe' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id');
    }

    public function entrenadores()
    {
        return $this->belongsToMany(Entrenador::class, 'pago_entrenador', 'pago_id', 'entrenador_id');
    }

    public function suscripciones()
    {
        return $this->belongsToMany(Suscripcion::class, 'pago_suscripcion', 'pago_id', 'suscripcion_id');
    }
}
