<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuscripcionUsuario extends Model
{
    use HasFactory;

    protected $table = 'suscripciones_usuarios';

    protected $appends = ['saldo_actual_calculado'];

    protected $fillable = [
        'id_usuario',
        'id_suscripcion',
        'id_entrenador',
        'saldo_actual',
        'ultima_recarga',
        'estado',
        'dia_recarga',
        'fecha_vencimiento_suscripcion',
        'pago_adelantado'
    ];

    /**
     * Relación con los lotes de créditos individuales.
     */
    public function lotes()
    {
        return $this->hasMany(CreditoLote::class, 'suscripcion_usuario_id');
    }

    /**
     * Calcula el saldo real sumando solo los lotes que no han caducado.
     */
    public function getSaldoActualCalculadoAttribute()
    {
        return $this->lotes()->validos()->sum('cantidad_actual');
    }

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
        return $this->belongsTo(Entrenador::class, 'id_entrenador');
    }
}
