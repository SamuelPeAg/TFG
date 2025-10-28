<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Centro extends Model
{
    use HasFactory;

    protected $table = "centros";
    protected $primaryKey = "id";

    protected $fillable = [
        "nombre",
        "direccion"
    ];


    //Un Centro tiene N Clases 
    public function clases()
    {
        return $this->hasMany(Clase::class, 'centro_id', 'id');
    }

    //Un Centro tiene N HorariosClases
    public function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'centro_id', 'id');
    }

}