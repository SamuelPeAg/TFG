<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable; 
use Illuminate\Database\Eloquent\SoftDeletes;

// Importante: Importar el modelo UserGroup
use App\Models\UserGroup;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'foto_de_perfil',
        'IBAN',
        'FirmaDigital', // Asegúrate que en tu BD sea 'FirmaDigital' o 'firma_digital' según tu migración anterior
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // --- RELACIÓN NUEVA ---
    public function groups()
    {
        return $this->belongsToMany(UserGroup::class, 'user_user_group');
    }
}