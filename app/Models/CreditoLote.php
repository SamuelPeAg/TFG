<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditoLote extends Model
{
    use HasFactory;

    protected $table = 'creditos_lotes';

    protected $fillable = [
        'suscripcion_usuario_id',
        'cantidad_inicial',
        'cantidad_actual',
        'fecha_vencimiento',
        'pago_id'
    ];

    protected $casts = [
        'fecha_vencimiento' => 'datetime',
    ];

    public function suscripcionUsuario()
    {
        return $this->belongsTo(SuscripcionUsuario::class, 'suscripcion_usuario_id');
    }

    public function pago()
    {
        return $this->belongsTo(Pago::class, 'pago_id');
    }

    /**
     * Scope para obtener lotes válidos (no caducados y con saldo).
     */
    public function scopeValidos($query)
    {
        return $query->where('fecha_vencimiento', '>=', now())
                     ->where('cantidad_actual', '>', 0);
    }
}
