<?php

namespace App\Models;

use App\Models\Centro;
use App\Models\Entrenador;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservaEntrenador extends Model
{
    use HasFactory;
    protected $table = 'reserva_entrenador';
    protected $primaryKey = 'id';

    protected $fillable = [
        'entrenador_id',
        'centro_id',
        'fecha_inicio',
        'fecha_fin',
        'disponible',
    ];

    // Esta disponibilidad pertenece a un Entrenador 
    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'entrenador_id', 'id');
    }

    // Esta disponibilidad se ofrece en un Centro 
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id', 'id');
    }
}