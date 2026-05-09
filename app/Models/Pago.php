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
        'serie',
        'numero_factura',
        'numero_completo',
        'centro',
        'nombre_clase',
        'tipo_clase',
        'capacidad_maxima',
        'metodo_pago',
        'iban',
        'importe',
        'horas_cancelacion',
        'fecha_registro',
    ];

    protected static function booted()
    {
        static::creating(function ($pago) {
            if (!$pago->numero_factura) {
                $centro = Centro::where('nombre', $pago->centro)->first();
                if ($centro) {
                    $pago->serie = $centro->serie_facturacion ?? 'G';
                    $centro->increment('ultimo_numero_factura');
                    $pago->numero_factura = $centro->ultimo_numero_factura;
                    
                    $anio = $pago->fecha_registro ? ($pago->fecha_registro instanceof \Carbon\Carbon ? $pago->fecha_registro->format('Y') : date('Y', strtotime($pago->fecha_registro))) : date('Y');
                    $pago->numero_completo = "{$pago->serie}-{$anio}-" . str_pad($pago->numero_factura, 4, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    protected $casts = [
        'fecha_registro' => 'datetime',
        'importe' => 'float',
        'horas_cancelacion' => 'integer',
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

    public function tiposCredito()
    {
        return $this->belongsToMany(TipoCredito::class, 'pago_tipo_credito', 'pago_id', 'tipo_credito_id');
    }

    public function centro_rel()
    {
        return $this->belongsTo(\App\Models\Centro::class, 'centro', 'nombre');
    }
}
