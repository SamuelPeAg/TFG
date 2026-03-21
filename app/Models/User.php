<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable, HasRoles;

    // Aquí añadimos 'activation_token' al array $fillable
    protected $fillable = [
        'name',
        'email',
        'password',
        'activation_token',
        'foto_de_perfil',
        'saldo',
    ];

    // Campos ocultos que no queremos exponer al usuario
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Si deseas castear algún campo, como la fecha de verificación del correo
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public function suscripciones()
    {
        return $this->hasMany(SuscripcionUsuario::class, 'id_usuario');
    }

    /**
     * Comprueba si el usuario tiene créditos suficientes para un tipo de clase,
     * teniendo en cuenta la jerarquía (un crédito superior puede pagar una clase inferior).
     */
    public function tieneCreditosPara($tipo_clase, $id_centro = null)
    {
        $jerarquia = ['ep', 'privado', 'duo', 'trio', 'especial', 'grupo'];
        $tipo_clase = strtolower($tipo_clase);
        
        // Buscar el nivel requerido (el primero que coincida parcialmente)
        $indexRequerido = -1;
        foreach ($jerarquia as $idx => $item) {
            if (str_contains($tipo_clase, $item)) {
                $indexRequerido = $idx;
                break;
            }
        }

        if ($indexRequerido === -1) return false;

        // Tipos que pueden pagar esta clase (el suyo y superiores)
        $tiposValidos = array_slice($jerarquia, 0, $indexRequerido + 1);

        return $this->suscripciones()
            ->where('estado', 'activo')
            ->where('saldo_actual', '>', 0)
            ->whereHas('suscripcion', function ($q) use ($tiposValidos, $id_centro) {
                // Comprobar si el tipo de crédito de la suscripción está en la lista de permitidos
                $q->where(function($subQ) use ($tiposValidos) {
                    foreach($tiposValidos as $tv) {
                        $subQ->orWhere('tipo_credito', 'LIKE', '%' . $tv . '%');
                    }
                });

                if ($id_centro) {
                    $q->where(function ($sub) use ($id_centro) {
                        $sub->where('id_centro', $id_centro)->orWhereNull('id_centro');
                    });
                }
            })->exists();
    }

    /**
     * Deduce un crédito del usuario para un tipo de clase específico.
     * Intenta usar primero el crédito más "bajo" que cumpla el requisito.
     */
    public function descontarCredito($tipo_clase, $id_centro = null)
    {
        $jerarquia = ['ep', 'privado', 'duo', 'trio', 'especial', 'grupo'];
        $tipo_clase = strtolower($tipo_clase);
        
        $indexRequerido = -1;
        foreach ($jerarquia as $idx => $item) {
            if (str_contains($tipo_clase, $item)) {
                $indexRequerido = $idx;
                break;
            }
        }

        if ($indexRequerido === -1) return false;

        // Buscamos las suscripciones activas del usuario que sirven
        $suscripcionesPosibles = $this->suscripciones()
            ->where('estado', 'activo')
            ->where('saldo_actual', '>', 0)
            ->with('suscripcion')
            ->get()
            ->filter(function ($su) use ($jerarquia, $indexRequerido, $id_centro) {
                $tipoCredito = strtolower($su->suscripcion->tipo_credito);
                
                // Buscar el nivel de este crédito
                $idxCredito = -1;
                foreach ($jerarquia as $idx => $item) {
                    if (str_contains($tipoCredito, $item)) {
                        $idxCredito = $idx;
                        break;
                    }
                }

                $isCorrectType = ($idxCredito !== -1 && $idxCredito <= $indexRequerido);
                $isCorrectCenter = (!$su->suscripcion->id_centro || $su->suscripcion->id_centro == $id_centro);
                return $isCorrectType && $isCorrectCenter;
            })
            // Ordenamos para usar el crédito de menor valor que sirva (el índice más alto en jerarquía)
            ->sortByDesc(function ($su) use ($jerarquia) {
                $tipoCredito = strtolower($su->suscripcion->tipo_credito);
                foreach ($jerarquia as $idx => $item) {
                    if (str_contains($tipoCredito, $item)) return $idx;
                }
                return -1;
            });

        $elegida = $suscripcionesPosibles->first();

        if ($elegida) {
            $elegida->decrement('saldo_actual');
            return true;
        }

        return false;
    }

    /**
     * Reembolsa un crédito al usuario.
     */
    public function reembolsarCredito($tipo_clase, $id_centro = null)
    {
        // Buscamos la primera suscripción activa que coincida con el tipo
        $tipo_clase = strtolower($tipo_clase);
        $suscripcion = $this->suscripciones()
            ->where('estado', 'activo')
            ->whereHas('suscripcion', function ($q) use ($tipo_clase, $id_centro) {
                $q->where('tipo_credito', 'LIKE', '%' . $tipo_clase . '%');
                if ($id_centro) {
                    $q->where(function ($sub) use ($id_centro) {
                        $sub->where('id_centro', $id_centro)->orWhereNull('id_centro');
                    });
                }
            })->first();

        if ($suscripcion) {
            $suscripcion->increment('saldo_actual');
            return true;
        }

        // Si no encontramos la específica, devolvemos a la primera activa
        $primera = $this->suscripciones()->where('estado', 'activo')->first();
        if ($primera) {
            $primera->increment('saldo_actual');
            return true;
        }

        return false;
    }
}
