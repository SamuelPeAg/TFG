<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuscripcionCredito extends Model
{
    use HasFactory;

    protected $table = 'suscripcion_creditos';

    protected $fillable = [
        'suscripcion_id',
        'tipo_credito_id',
        'cantidad',
        'dias_caducidad',
    ];

    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class);
    }

    public function tipoCredito()
    {
        return $this->belongsTo(TipoCredito::class, 'tipo_credito_id');
    }
}
