<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class ReservaEntrenador extends Model
{
    use HasFactory;

    protected $table = 'reserva_entrenador';
    protected $primaryKey = 'id';

    protected $fillable = [
        'hora_inicio',
        'hora_fin',
        'fecha',
        'disponible',
        'centro_id',
        'entrenador_id',
    ];

 



    // Este Reserva pertenece a un Entrenador 
    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id', 'id');
    }

    // Este Reserva se ofrece en un Centro 
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id', 'id');
    }

    //Este Reserva puede tener N reservas 
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'Reserva_entrenador_id', 'id');
    }
}