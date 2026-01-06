<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sessiones extends Model
{
    use HasFactory;

    // Nombre de tu tabla en la base de datos
    protected $table = 'sessiones'; 

    // Los campos que se pueden rellenar (asegúrate que coinciden con tu BD)
    protected $fillable = [
        'user_id',
        'IBAN',
        'Pago',
        'Fecharegistro',
    ];

    /**
     * IMPORTANTE: Esto convierte el texto de la base de datos 
     * en objetos de fecha y números reales automáticamente.
     */
    protected $casts = [
        'Fecharegistro' => 'datetime', // Vital para que funcione ->format('H:i')
        'Pago'          => 'float',    // Para manejarlo como número decimal
    ];

    // Relación: Una sesión pertenece a un Usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}