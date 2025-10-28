<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class Entrenador extends Model
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $table = 'entrenadores';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nombre',
        'email',
    ];

    //Un Entrenador imparte N Clases 
    public function clases()
    {
        return $this->belongsToMany(Clase::class, 'clase_entrenador', 'entrenador_id', 'clase_id');
    }

    //Un Entrenador tiene N Facturas 
    public function facturas()
    {
        return $this->hasMany(FacturaEntrenador::class, 'entrenador_id', 'id');
    }


}