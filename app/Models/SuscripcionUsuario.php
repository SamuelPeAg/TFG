<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuscripcionUsuario extends Model
{
    use HasFactory;

    protected $table = 'suscripciones_usuarios';

    protected $fillable = [
        'id_usuario',
        'id_suscripcion',
        'id_entrenador',
        'saldo_actual',
        'ultima_recarga',
        'estado'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class, 'id_suscripcion');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function entrenador()
    {
        return $this->belongsTo(User::class, 'id_entrenador');
    }
}
