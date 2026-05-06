<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class Entrenador extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;
    
    protected $appends = ['photo'];

    protected $table = 'entrenadores';
    protected $guard_name = 'staff'; // Forzar la guardia para Spatie

    protected $fillable = [
        'name',
        'email',
        'password',
        'dni',
        'foto_de_perfil',
        'iban',
        'firma_digital',
        'precio_hora',
        'activo',
        'activation_token',
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
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function centro()
    {
        return $this->belongsTo(Centro::class);
    }

    public function clasesImpartidas()
    {
        return $this->hasMany(HorarioClase::class, 'entrenador_id');
    }

    public function nominas()
    {
        return $this->hasMany(Nomina_entrenador::class, 'entrenador_id');
    }

    public function notificaciones()
    {
        return $this->hasMany(NotificacionEntrenador::class, 'entrenador_id');
    }

    public function getPhotoAttribute()
    {
        return $this->foto_de_perfil ? asset('storage/' . $this->foto_de_perfil) : null;
    }
}
