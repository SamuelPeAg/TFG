<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;
    
    protected $appends = ['photo'];

    protected $fillable = [
        'name',
        'email',
        'password',
        'iban',
        'firma_digital',
        'dni',
        'direccion',
        'codigo_postal',
        'ciudad',
        'activation_token',
        'activation_token_expires_at',
        'activo',
        'foto_de_perfil',
        'altura',
        'peso',
        'additional_attributes',
        'centro_id',
        'empresa_id',
        'google_id',
        'google_token',
        'google_refresh_token',
        'google_token_expires_at',
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

    public function measurements()
    {
        return $this->hasMany(UserMeasurement::class);
    }

    public function getPhotoAttribute()
    {
        $path = trim($this->foto_de_perfil ?? '');
        return !empty($path) ? asset('storage/' . $path) : null;
    }
}
