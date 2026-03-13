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
        'activation_token',  // Agregado para el token de activación
        'foto_de_perfil',
        'iban',
        'firma_digital',
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

    
    public function PagosCreadas()
    {
        return $this->hasMany(Pago::class, 'entrenador_id');
    }

    // Relación de uno a muchos con HorarioClase (si el usuario es entrenador)
    public function horariosComoEntrenador()
    {
        return $this->hasMany(HorarioClase::class, 'entrenador_id');
    }

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
        $jerarquia = ['ep', 'duo', 'trio', 'Grupo especial', 'Grupo'];
        $indexRequerido = array_search($tipo_clase, $jerarquia);

        if ($indexRequerido === false) return false;

        // Tipos que pueden pagar esta clase (el suyo y superiores)
        $tiposValidos = array_slice($jerarquia, 0, $indexRequerido + 1);

        return $this->suscripciones()
            ->where('estado', 'activo')
            ->where('saldo_actual', '>', 0)
            ->whereHas('suscripcion', function ($q) use ($tiposValidos, $id_centro) {
                $q->whereIn('tipo_credito', $tiposValidos);
                if ($id_centro) {
                    $q->where(function($sub) use ($id_centro) {
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
        $jerarquia = ['ep', 'duo', 'trio', 'Grupo especial', 'Grupo'];
        $indexRequerido = array_search($tipo_clase, $jerarquia);

        if ($indexRequerido === false) return false;

        // Buscamos las suscripciones activas del usuario que sirven
        $suscripcionesPosibles = $this->suscripciones()
            ->where('estado', 'activo')
            ->where('saldo_actual', '>', 0)
            ->with('suscripcion')
            ->get()
            ->filter(function($su) use ($jerarquia, $indexRequerido, $id_centro) {
                $idx = array_search($su->suscripcion->tipo_credito, $jerarquia);
                $isCorrectType = ($idx !== false && $idx <= $indexRequerido);
                $isCorrectCenter = (!$su->suscripcion->id_centro || $su->suscripcion->id_centro == $id_centro);
                return $isCorrectType && $isCorrectCenter;
            })
            // Ordenamos para usar el crédito de menor valor que sirva (el índice más alto en jerarquía)
            ->sortByDesc(function($su) use ($jerarquia) {
                return array_search($su->suscripcion->tipo_credito, $jerarquia);
            });

        $elegida = $suscripcionesPosibles->first();

        if ($elegida) {
            $elegida->decrement('saldo_actual');
            return true;
        }

        return false;
    }
}
