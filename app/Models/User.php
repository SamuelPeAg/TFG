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

    protected $fillable = [
        'name',
        'email',
        'password',
        'dni',
        'direccion',
        'codigo_postal',
        'ciudad',
        'activation_token',
        'activation_token_expires_at',
        'activo',
        'foto_de_perfil',
        'additional_attributes',
        'centro_id',
        'empresa_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'activation_token_expires_at' => 'datetime',
        'additional_attributes' => 'array',
        'activo' => 'boolean',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function centro()
    {
        return $this->belongsTo(Centro::class);
    }

    // Relación de uno a muchos con SuscripcionUsuario (para clientes)
    public function suscripciones()
    {
        return $this->hasMany(\App\Models\SuscripcionUsuario::class, 'id_usuario');
    }

    // Relación con archivos del cliente (Historia Clínica / Notas)
    public function clientFiles()
    {
        return $this->hasMany(ClientFile::class);
    }
}
