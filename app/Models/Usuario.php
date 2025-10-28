<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; // Importa Model, no Authenticatable
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Model 
{
    use Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    /**
     * Configuración clave para la relación 1:1
     * La clave primaria es 'user_id' y no es autoincremental.
     */
    protected $primaryKey = 'user_id';
    public $incrementing = false; 

    protected $fillable = [
        'user_id',
        'foto_de_perfil',
        'IBAN',
        'FirmaDigital',
    ];

    protected $hidden = [];

    /**
     * Relación inversa 1:1.
     * Permite acceder al User ($usuario->user)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}